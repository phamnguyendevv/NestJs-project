import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'ID của user' })
  @IsInt()
  owner_id: number;

  @ApiProperty({ description: 'Tên của project' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Mô tả của project' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Trạng thái của project' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Key của project' })
  @IsString()
  project_key: string;

  @ApiProperty({ description: 'Ngày bắt đầu của project' })
  startdate_at: Date;

  @ApiProperty({ description: 'Ngày tạo của project' })
  created_at: Date;
}
