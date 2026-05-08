export interface JwtPayload {
  sub: number;
  email: string;
  jti?: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  refreshToken?: string;
}
