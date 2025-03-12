import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';
import { AuthMiddleware } from '../user/auth.middleware';
import { UploadModule } from '../upload/upload.module';
import { CommentModule } from '../comment/comment.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UserModule,
    ProjectModule,
    UploadModule,
    forwardRef(() => CommentModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'task',
      method: RequestMethod.GET,
    });
  }
}
