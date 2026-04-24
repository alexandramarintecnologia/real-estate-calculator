import { IsEmail } from 'class-validator';

export class CheckNewUserDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  email!: string;
}
