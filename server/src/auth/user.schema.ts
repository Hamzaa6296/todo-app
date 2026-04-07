import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: Number })
  otp?: number;

  @Prop({ default: false })
  isVerified!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);