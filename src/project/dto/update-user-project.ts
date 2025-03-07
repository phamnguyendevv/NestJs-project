import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateUserProjectDto {
  @ApiProperty({ description: 'ID của thành viên project' })
  @IsInt({ each: true })
  userIds: Array<number>;

  @ApiProperty({ description: 'ID của người chủ project ' })
  @IsInt()
  owner_id: number;
}
