import { IsInt } from 'class-validator';

export class UpdateUserProjectDto {
  @IsInt({ each: true })
  userIds: Array<number>;

  @IsInt()
  owner_id: number;
}
