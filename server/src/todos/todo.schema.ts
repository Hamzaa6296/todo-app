import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Todo extends Document {
  @Prop({ required: true })
  task!: string;

  @Prop({ default: false })
  completed!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId; 
}

export const TodoSchema = SchemaFactory.createForClass(Todo);