import { IsInt, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsInt()
  owner_id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  status: string;

  @IsString()
  project_key: string;

  startdate_at: Date;

  created_at: Date;
}
