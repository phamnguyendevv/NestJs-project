import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Tên của user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email của user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Mật khẩu của user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
