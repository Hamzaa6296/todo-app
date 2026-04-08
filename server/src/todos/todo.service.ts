import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Todo } from './todo.schema';

@Injectable()
export class TodosService {
    constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) { }

    async syncExternalTodos(userId: string) {
        if (!userId || userId === "null" || userId === "undefined") {
            console.warn("syncExternalTodos called without a valid userId");
            return [];
        }

        try {
            const userObjectId = new Types.ObjectId(userId);
            return await this.todoModel
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            console.error("Invalid ObjectId provided:", userId);
            return [];
        }
    }

    async create(userId: string, task: string, quantity: number) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid User ID format");
        }

        const newTodo = new this.todoModel({
            userId: new Types.ObjectId(userId),
            task,
            quantity: quantity || 1
        });

        return await newTodo.save();
    }

    async update(id: string, updateData: Partial<Todo>) {
        const todo = await this.todoModel.findByIdAndUpdate(
            id,
            updateData, // This will now dynamically update whatever is sent (task, quantity, or completed)
            { new: true },
        );
        if (!todo) throw new NotFoundException('Todo not found');
        return todo;
    }
    async remove(id: string) {
        const result = await this.todoModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException('Todo not found');
        return { message: 'Deleted successfully' };
    }
}