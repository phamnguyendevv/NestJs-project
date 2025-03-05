import { IsInt } from 'class-validator';

export class UpdateProjectDto {
  @IsInt()
  owner_id: number;
  name: string;

  description: string;

  status: string;

  project_key: string;
}
