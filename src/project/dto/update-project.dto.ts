import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({ description: 'ID của user' })
  @IsInt()
  owner_id: number;

  @ApiProperty({ description: 'Tên của project' })
  name: string;

  @ApiProperty({ description: 'Mô tả của project' })
  description: string;

  @ApiProperty({ description: 'Trạng thái của project' })
  status: string;

  @ApiProperty({ description: 'Key của project' })
  project_key: string;
}
