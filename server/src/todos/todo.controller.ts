import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TodosService } from './todo.service';
import { Todo } from './todo.schema';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @Get()
  async getTodos(@Query('userId') userId: string) {
    return this.todosService.syncExternalTodos(userId);
  }
  @Post()
  async createTodo(@Body() body: { userId: string; task: string; quantity?: number }) {
    const qty = body.quantity ?? 1;
    return this.todosService.create(body.userId, body.task, qty);
  }

  @Put(':id')
  async updateTodo(
    @Param('id') id: string,
    @Body() updateData: Partial<Todo> // Receive the whole object
  ) {
    return this.todosService.update(id, updateData);
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}