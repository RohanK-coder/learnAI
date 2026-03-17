import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}