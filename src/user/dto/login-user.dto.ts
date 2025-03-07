import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'Email của user' })
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'Mật khẩu của user' })
  @IsNotEmpty()
  readonly password: string;
}
