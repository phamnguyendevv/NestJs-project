import { forwardRef, Logger, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentGateway } from './comment.gateway';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from '../task/task.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => TaskModule),
    UserModule,
  ],
  providers: [CommentGateway, CommentService, Logger],
  exports: [CommentService],
})
export class CommentModule {}
