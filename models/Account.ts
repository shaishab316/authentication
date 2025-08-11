import mongoose, { Schema, type Document } from "mongoose"

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId // Link to User model
  name: string
  issuer: string
  secret: string // This will store the encrypted secret
  tags: string[]
}

const AccountSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  secret: { type: String, required: true }, // Stores encrypted string
  tags: { type: [String], default: [] },
})

const Account = mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema)

export default Account
