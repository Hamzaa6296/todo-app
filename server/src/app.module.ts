import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todo.module';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://admin:hamza6296@cluster5.fn99rjs.mongodb.net/'), 
    AuthModule,
    TodosModule
  ],
  
})
export class AppModule {}
