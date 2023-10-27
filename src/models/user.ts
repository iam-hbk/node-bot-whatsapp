import { Schema, model } from "mongoose";

export interface IUser {
  phoneNumber: string;
  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  phoneNumber: { type: String, required: true },
  isActive: { type: Boolean, required: true, default: true },
});

const User = model<IUser>("User", userSchema);

export default User;