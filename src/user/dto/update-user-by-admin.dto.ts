import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserByAdminDto {
  @ApiProperty({ description: 'ID của user' })
  readonly id: number;

  @ApiProperty({ description: 'Tên của user' })
  readonly username: string;

  @ApiProperty({ description: 'Email của user' })
  readonly email: string;

  @ApiProperty({ description: 'Roles của user' })
  readonly roles: string;
}
