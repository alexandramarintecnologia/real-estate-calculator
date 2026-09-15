"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { APARTMENT_ROOMS } from "@/lib/apartment-layout";
import { createTierPalette, type Disposables } from "@/lib/room-design";
import { buildInterior, rbox, type BuildCtx } from "@/lib/room-interiors";
import { buildDesignLamp, hasDesignLamp } from "@/lib/room-lighting";
import type { BudgetTierId } from "@/types/remodeling.types";

interface RoomSceneProps {
  roomId: string;
  tier: BudgetTierId;
}

const CEILING_H = 2.6;

/** Ambientes sin puerta interior: el balcon se abre a la sala. */
const NO_DOOR = new Set(["balcon_terraza", "zona_social", "entrada_hall"]);

/**
 * Encuadres frontales, a un punto de fuga. En ambientes con un frente
 * protagonista mirar de frente y centrado es lo que separa una foto de catalogo
 * de una maqueta vista en diagonal.
 */
const FRONTAL_VIEW = new Set(["cocina", "bano_principal", "bano_social", "zona_ropas"]);

/** Piezas de larga vida: se crean una vez y sobreviven a los cambios de cuarto. */
interface SceneCore {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  composer: EffectComposer;
  gtao: GTAOPass;
}

/**
 * Vista interior de un ambiente resuelto con los acabados de un nivel.
 *
 * El contexto WebGL se crea UNA sola vez y vive mientras viva el componente.
 * Al cambiar de ambiente o de nivel se reemplaza el contenido de la escena, no
 * el renderer: crear uno nuevo en cada cambio agota el limite de contextos del
 * navegador (entre 8 y 16) y a los pocos cambios deja de poder crearlos.
 */
export default function RoomScene({ roomId, tier }: RoomSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<SceneCore | null>(null);
  // Lo que si se rehace en cada cambio: contenido del cuarto y sus recursos.
  const roomRootRef = useRef<THREE.Group | null>(null);
  const roomSinkRef = useRef<Disposables>([]);
  // Render bajo demanda: sin esto el visor dibuja 60 veces por segundo para
  // siempre, incluso fuera de pantalla, y le compite cada frame al scroll.
  const dirtyRef = useRef(true);
  const visibleRef = useRef(true);

  // ── Nucleo: renderer, camara, controles y postproceso. Se monta una vez. ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    // shadowMap.enabled va antes que cualquier castShadow: si no, el mapa nunca
    // se reserva y los flags se ignoran en silencio.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    mount.appendChild(renderer.domElement);

    // Iluminacion basada en imagen: un entorno de interior generado por codigo
    // que sirve de reflejo a todos los materiales PBR.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.05,
      100,
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    // ── Postproceso: oclusion ambiental ──
    // Sin oclusion los objetos parecen flotar: falta el oscurecimiento en los
    // encuentros, que es la pista de profundidad que mas delata un render.
    const w0 = mount.clientWidth;
    const h0 = mount.clientHeight;

    // El composer rinde a sus propios targets, asi que el antialias del
    // renderer no aplica: se pide multimuestreo o los bordes quedan dentados.
    const target = new THREE.WebGLRenderTarget(w0, h0, {
      samples: 2,
      type: THREE.HalfFloatType,
    });
    const composer = new EffectComposer(renderer, target);
    // GTAO cuesta por pixel: a densidad 2 son cuatro veces mas trabajo que a 1.
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    composer.setSize(w0, h0);
    composer.addPass(new RenderPass(scene, camera));

    const gtao = new GTAOPass(scene, camera, w0, h0);
    gtao.output = GTAOPass.OUTPUT.Default;
    gtao.updateGtaoMaterial({
      radius: 0.32,
      distanceExponent: 1.4,
      thickness: 0.35,
      scale: 1.0,
      samples: 8,
      screenSpaceRadius: false,
    });
    composer.addPass(gtao);

    // OutputPass aplica tone mapping y espacio de color al final de la cadena,
    // que es donde corresponde cuando hay postproceso.
    composer.addPass(new OutputPass());

    coreRef.current = { renderer, scene, camera, controls, composer, gtao };

    const resizeObserver = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = mount;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      composer.setSize(clientWidth, clientHeight);
      gtao.setSize(clientWidth, clientHeight);
      dirtyRef.current = true;
    });
    resizeObserver.observe(mount);

    // Fuera de pantalla no se dibuja nada: es lo que libera el scroll.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) dirtyRef.current = true;
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(mount);

    // Tampoco con la pestana en segundo plano.
    const onVisibility = () => {
      if (document.visibilityState === "visible") dirtyRef.current = true;
    };
    document.addEventListener("visibilitychange", onVisibility);

    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      if (!visibleRef.current || document.visibilityState !== "visible") return;

      // update() devuelve true mientras la camara se sigue moviendo, incluida
      // la inercia del amortiguado. En reposo no se dibuja ni un frame.
      const moved = controls.update();
      if (moved || dirtyRef.current) {
        composer.render();
        dirtyRef.current = false;
      }
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      controls.dispose();
      composer.dispose();
      target.dispose();
      gtao.dispose();
      envRT.dispose();
      scene.environment = null;
      renderer.dispose();
      // Devuelve el contexto al navegador de inmediato en vez de esperar al
      // recolector: sin esto los contextos se acumulan entre navegaciones.
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      coreRef.current = null;
    };
  }, []);

  // ── Contenido: se rehace al cambiar de ambiente o de nivel ──
  useEffect(() => {
    const core = coreRef.current;
    if (!core) return;

    const room = APARTMENT_ROOMS.find((r) => r.id === roomId);
    if (!room) return;

    const { scene, camera, controls } = core;

    // Fuera lo anterior, con todos sus recursos de GPU.
    if (roomRootRef.current) {
      scene.remove(roomRootRef.current);
      roomRootRef.current = null;
    }
    roomSinkRef.current.forEach((d) => d.dispose());
    roomSinkRef.current = [];

    const sink: Disposables = [];
    roomSinkRef.current = sink;

    const root = new THREE.Group();
    roomRootRef.current = root;
    scene.add(root);

    const { width, depth } = room;
    const palette = createTierPalette(tier, sink, roomId);
    const ctx: BuildCtx = { palette, sink, width, depth, height: CEILING_H };

    // ── Camara ──
    const frontal = FRONTAL_VIEW.has(roomId);
    if (frontal) {
      camera.position.set(0, 1.5, depth * 0.98);
    } else {
      camera.position.set(width * 0.42, 1.68, depth * 0.92);
    }
    controls.target.set(0, frontal ? 1.35 : 1.1, frontal ? -depth / 2 : -depth * 0.2);
    controls.minDistance = 1.0;
    controls.maxDistance = Math.max(width, depth) * 1.7;
    controls.maxPolarAngle = Math.PI / 1.9;
    controls.update();

    // ── Recinto ──
    function plane(
      material: THREE.Material,
      w: number,
      h: number,
      rx: number,
      ry: number,
      x: number,
      y: number,
      z: number,
      receive = true,
    ) {
      const geo = new THREE.PlaneGeometry(w, h);
      sink.push(geo);
      const mesh = new THREE.Mesh(geo, material);
      mesh.rotation.set(rx, ry, 0);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = receive;
      root.add(mesh);
    }

    plane(palette.floor, width, depth, -Math.PI / 2, 0, 0, 0, 0);
    plane(palette.ceiling, width, depth, Math.PI / 2, 0, 0, CEILING_H, 0, false);
    plane(palette.wall, width, CEILING_H, 0, 0, 0, CEILING_H / 2, -depth / 2);
    plane(palette.wall, depth, CEILING_H, 0, Math.PI / 2, -width / 2, CEILING_H / 2, 0);
    plane(palette.wall, depth, CEILING_H, 0, -Math.PI / 2, width / 2, CEILING_H / 2, 0);

    // Guardaescobas: sin esto piso y pared se tocan con una arista imposible.
    const skirtH = 0.1;
    root.add(rbox(ctx, palette.white, width, skirtH, 0.022, 0, 0, -depth / 2 + 0.011));
    root.add(rbox(ctx, palette.white, 0.022, skirtH, depth, -width / 2 + 0.011, 0, 0));
    root.add(rbox(ctx, palette.white, 0.022, skirtH, depth, width / 2 - 0.011, 0, 0));

    if (palette.decorLevel > 0) {
      const cornH = 0.07;
      root.add(rbox(ctx, palette.ceiling, width, cornH, 0.05, 0, CEILING_H - cornH, -depth / 2 + 0.025));
      root.add(rbox(ctx, palette.ceiling, 0.05, cornH, depth, -width / 2 + 0.025, CEILING_H - cornH, 0));
      root.add(rbox(ctx, palette.ceiling, 0.05, cornH, depth, width / 2 - 0.025, CEILING_H - cornH, 0));
    }

    // ── Ventana ──
    const winH = 1.25;
    const winW = Math.min(depth * 0.55, 1.5);
    const winY = 1.0;
    const wx = width / 2;

    const winGlass = rbox(ctx, palette.glass, 0.03, winH, winW, wx - 0.03, winY, 0);
    winGlass.castShadow = false;
    root.add(winGlass);

    const frameT = 0.06;
    root.add(rbox(ctx, palette.white, 0.07, frameT, winW + frameT * 2, wx - 0.035, winY - frameT, 0));
    root.add(rbox(ctx, palette.white, 0.07, frameT, winW + frameT * 2, wx - 0.035, winY + winH, 0));
    root.add(rbox(ctx, palette.white, 0.07, winH, frameT, wx - 0.035, winY, -winW / 2 - frameT / 2));
    root.add(rbox(ctx, palette.white, 0.07, winH, frameT, wx - 0.035, winY, winW / 2 + frameT / 2));
    root.add(rbox(ctx, palette.counter, 0.16, 0.04, winW + 0.16, wx - 0.08, winY - frameT - 0.04, 0));

    if (palette.decorLevel > 0) {
      [-1, 1].forEach((s) => {
        root.add(
          rbox(ctx, palette.fabric, 0.1, winH + 0.75, 0.28, wx - 0.16, winY - 0.4, s * (winW / 2 + 0.16)),
        );
      });
      root.add(rbox(ctx, palette.metal, 0.04, 0.04, winW + 0.7, wx - 0.16, winY + winH + 0.12, 0));
    }

    // ── Puerta ──
    if (!NO_DOOR.has(roomId)) {
      const doorH = 2.05;
      const doorW = 0.85;
      const dxw = -width / 2;
      root.add(rbox(ctx, palette.wood, 0.05, doorH, doorW, dxw + 0.03, 0, -depth * 0.18));
      root.add(rbox(ctx, palette.white, 0.08, doorH + 0.06, 0.07, dxw + 0.04, 0, -depth * 0.18 - doorW / 2 - 0.035));
      root.add(rbox(ctx, palette.white, 0.08, doorH + 0.06, 0.07, dxw + 0.04, 0, -depth * 0.18 + doorW / 2 + 0.035));
      root.add(rbox(ctx, palette.white, 0.08, 0.07, doorW + 0.14, dxw + 0.04, doorH, -depth * 0.18));
      root.add(rbox(ctx, palette.metal, 0.07, 0.03, 0.12, dxw + 0.08, 1.03, -depth * 0.18 + doorW / 2 - 0.12));
    }

    // ── Interior ──
    root.add(buildInterior(roomId, ctx));

    // ── Luces ──
    root.add(new THREE.HemisphereLight(0xffffff, 0xdcd6cc, 0.9));

    const sun = new THREE.DirectionalLight(0xfff4e4, 1.9);
    sun.position.set(width * 1.6, 2.6, depth * 0.25);
    sun.target.position.set(-width * 0.2, 0.6, -depth * 0.1);
    root.add(sun.target);
    // Unica luz que proyecta sombra: el mapa se redibuja entero cada frame.
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 26;
    const span = Math.max(width, depth);
    sun.shadow.camera.left = -span;
    sun.shadow.camera.right = span;
    sun.shadow.camera.top = span;
    sun.shadow.camera.bottom = -span;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 6;
    // La escena es estatica: basta con calcular la sombra una vez en vez de
    // redibujarla entera desde la luz en cada frame.
    sun.shadow.autoUpdate = false;
    sun.shadow.needsUpdate = true;
    root.add(sun);

    const fill = new THREE.DirectionalLight(0xfff8ee, 0.7);
    fill.position.set(-width * 0.4, 2.0, depth * 1.6);
    root.add(fill);

    const ceilingLight = new THREE.PointLight(0xfff0da, 7, 9, 2);
    ceilingLight.position.set(0, CEILING_H - 0.3, 0);
    root.add(ceilingLight);

    // Con luminaria de diseno el plafon sobra: quedarian dos aparatos en el
    // mismo techo. Solo se mantiene la luz, atenuada, como relleno.
    const hasOwnLamp = palette.hasPendants && hasDesignLamp(roomId);
    if (!hasOwnLamp) {
      const plafon = rbox(ctx, palette.lamp, 0.42, 0.05, 0.42, 0, CEILING_H - 0.05, 0, 0.02);
      plafon.castShadow = false;
      root.add(plafon);
    } else {
      ceilingLight.intensity = 2.5;
    }

    if (roomId === "cocina") {
      const underCabinet = new THREE.PointLight(0xfff3de, 3.4, 4.5, 2);
      underCabinet.position.set(0, 1.38, -depth / 2 + 0.32);
      root.add(underCabinet);
    }

    if (palette.hasCoveLight) {
      const cove = new THREE.PointLight(0xffe4bc, 4.5, 6, 2);
      cove.position.set(0, CEILING_H - 0.2, -depth / 2 + 0.45);
      root.add(cove);
    }

    // Luminaria de diseno del nivel alto: una distinta por ambiente. Los banos
    // reciben apliques junto al espejo en vez de algo colgando del techo.
    if (palette.hasPendants && hasDesignLamp(roomId)) {
      root.add(buildDesignLamp(roomId, ctx));
    }

    dirtyRef.current = true;
  }, [roomId, tier]);

  return <div ref={mountRef} className="h-full w-full" />;
}
