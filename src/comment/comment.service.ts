import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserService } from '../user/user.service';
import { TaskService } from '../task/task.service';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly logger: Logger,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    console.log(createCommentDto);
    const { userId, taskId } = createCommentDto;
    console.log('userId', userId);
    console.log('taskId', taskId);
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException(
        {
          message: 'User not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('user', user);
    const task = await this.taskService.findOne(taskId);
    if (!task) {
      throw new HttpException(
        {
          message: 'Task not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('task', task);
    const comment = this.commentRepo.create({
      ...createCommentDto,
      user: { id: userId },
      task: { id: taskId },
    });

    const errors = await validate(comment);
    if (errors.length > 0) {
      this.logger.error(
        `Input data validation failed: ${JSON.stringify(errors)}`,
      );
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const saveComment = await this.commentRepo.save(comment);
      console.log('saveComment', saveComment);
      return {
        message: 'Comment created successfully.',
        data: saveComment,
        statusCode: 200,
      };
    }
  }

  async findAll(id: number) {
    console.log('id', id);
    const comments = await this.commentRepo.find({
      where: { task: { id: id } },
    });
    console.log('comments', comments);
    return comments;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = this.commentRepo.create(updateCommentDto);
    comment.id = id;
    const findComment = await this.commentRepo.findOne({ where: { id } });
    if (!findComment) {
      throw new HttpException(
        {
          message: 'Comment not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.commentRepo.save(comment);
  }

  async remove(id: number) {
    console.log('id', id);
    const findComment = await this.commentRepo.findOne({ where: { id } });
    if (!findComment) {
      throw new HttpException(
        {
          message: 'Comment not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.commentRepo.delete(id);
  }
}
