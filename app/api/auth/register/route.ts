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

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ username, password: hashedPassword })

    const token = generateToken({ userId: newUser._id, username: newUser.username })

    return NextResponse.json({ message: "User registered successfully", token, userId: newUser._id }, { status: 201 })
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}
