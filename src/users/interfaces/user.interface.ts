export interface User {
  id?: number;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreateDto {
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}
