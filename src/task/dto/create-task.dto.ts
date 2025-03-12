import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'ID của user' })
  userId: number;

  @ApiProperty({ description: 'ID của project' })
  projectId: number;

  @ApiProperty({ description: 'Tiêu đề của task' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mô tả của task' })
  @IsString()
  descriptionText: string;

  @ApiProperty({ description: 'Hình ảnh của task' })
  descriptionImage: string[];

  @ApiProperty({ description: 'Trạng thái của task' })
  status: string;

  @ApiProperty({ description: 'Ngày bắt đầu của task' })
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc của task' })
  endDate: string;
}
