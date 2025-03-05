export class UpdateUserDto {
  readonly username: string;
  readonly email: string;
  readonly roles: string;
}

export class UpdateUserByAdminDto {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly roles: string;
}
