import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { generateToken } from "@/lib/jwt"

export async function POST(req: Request) {
  await dbConnect()
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid ) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken({ userId: user._id, username: user.username })

    return NextResponse.json({ message: "Login successful", token, userId: user._id }, { status: 200 })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ message: "Login failed" }, { status: 500 })
  }
}
