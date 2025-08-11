import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key" // Use a strong secret in production!

export function generateToken(payload: object, expiresIn = "1h"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): string | jwt.JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
