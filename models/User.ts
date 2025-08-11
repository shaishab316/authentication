import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  username: string
  password: string // Hashed password
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
