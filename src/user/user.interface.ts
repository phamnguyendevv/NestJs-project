export interface UserData {
  id?: number;
  username: string;
  email: string;
  roles: string;
  token?: string;
}

export interface UserRO {
  user: UserData;
}

export interface UserDecoratorOptions {
  field?: keyof UserData; 
  roles?: string[]; 
}