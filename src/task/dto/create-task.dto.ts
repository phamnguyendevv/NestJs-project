import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'ID của user' })
  user_id: number;

  @ApiProperty({ description: 'ID của project' })
  project_id: number;

  @ApiProperty({ description: 'Tiêu đề của task' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mô tả của task' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Trạng thái của task' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Ngày bắt đầu của task' })
  start_date: string;

  @ApiProperty({ description: 'Ngày kết thúc của task' })
  end_date: string;
}
