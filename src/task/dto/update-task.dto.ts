import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ description: 'ID của user' })
  userId: number;

  @ApiProperty({ description: 'Tiêu đề của task' })
  title: string;

  @ApiProperty({ description: 'Mô tả của task' })
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
