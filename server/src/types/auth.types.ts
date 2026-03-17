export type UserRole = "student" | "professor" | "admin";

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}