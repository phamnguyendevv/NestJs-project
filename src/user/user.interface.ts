export interface UserData {
  id?: number;
  username: string;
  email: string;
  roles: string;
  accessToken?: string;
  refreshToken?: string;
  created_at: Date;
}

export interface UserRO {
  data: UserData;
  message: string;
  statusCode: number;
}

export interface UserDecoratorOptions {
  field?: keyof UserData;
  roles?: string[];
}
