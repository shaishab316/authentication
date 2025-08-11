import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"

// Middleware to protect routes
const authenticate = async (req: Request) => {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json({ message: "No token provided" }, { status: 401 }),
    }
  }

  const decoded = verifyToken(token)
  if (!decoded || typeof decoded === "string") {
    return {
      authenticated: false,
      response: NextResponse.json({ message: "Invalid token" }, { status: 403 }),
    }
  }

  return { authenticated: true, userId: decoded.userId }
}

export async function POST(req: Request) {
  const authResult = await authenticate(req)
  if (!authResult.authenticated) {
    return authResult.response
  }

  await dbConnect()
  try {
    const { oldPassword, newPassword } = await req.json()
    const userId = authResult.userId

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Old password and new password are required" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Incorrect old password" }, { status: 401 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await user.save()

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: "Failed to change password" }, { status: 500 })
  }
}
