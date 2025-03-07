import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserByAdminDto {
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

  @ApiProperty({ description: 'Quyền của user' })
  @IsString()
  @IsNotEmpty()
  roles: string;
}
