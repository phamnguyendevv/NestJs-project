import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageStatus, Task } from './entities/task.entity';
import { UserService } from '../user/user.service';
import { ProjectService } from '../project/project.service';
import { validate } from 'class-validator';
import { UploadService } from 'upload/upload.service';
import { FindTaskDto } from './dto/find-task.dto';
import { Roles } from 'config/user.config';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly uploadService: UploadService,
    private dataSource: DataSource,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<any> {
    const { user_id, project_id } = createTaskDto;

    const user = await this.userService.findById(user_id);
    if (!user) {
      throw new HttpException(
        {
          message: 'User not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const project = await this.projectService.findOne(project_id);
    if (!project) {
      throw new HttpException(
        {
          message: 'Project not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const task = this.taskRepo.create({
      ...createTaskDto,
      user: { id: user_id },
      project: { id: project_id },
    });

    const errors = await validate(task);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const saveTask = await this.taskRepo.save(task);
      return {
        message: 'Task created successfully.',
        data: saveTask,
        statusCode: 200,
      };
    }
  }

  async createWithImages(
    createTaskDto: CreateTaskDto,
    file: Express.Multer.File,
  ): Promise<any> {
    const { user_id, project_id } = createTaskDto;
    // Bắt đầu transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let uploadResult: { secure_url: string; public_id: string } | null = null;

    try {
      const task = new Task();
      Object.assign(task, {
        ...createTaskDto,
        user: { id: user_id },
        project: { id: project_id },
        imageStatus: ImageStatus.PROCESSING,
      });
      const savedTask = await queryRunner.manager.save(task);

      // 2. Upload ảnh
      uploadResult = await this.uploadService.uploadImage(file, 'tasks');

      // 3. Cập nhật task với thông tin ảnh
      savedTask.imageUrl = uploadResult.secure_url;
      savedTask.imageThumbnailUrl = uploadResult.secure_url;
      savedTask.imagePublicId = uploadResult.public_id;
      savedTask.imageStatus = ImageStatus.COMPLETED;

      const updatedTask = await queryRunner.manager.save(savedTask);
      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        data: updatedTask,
        message: 'Task created successfully',
        statusCode: 200,
      };
    } catch (error) {
      const err = error as Error;

      // Rollback transaction nếu đã bắt đầu
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      if (uploadResult) {
        try {
          await this.uploadService.deleteImage(uploadResult.public_id);
        } catch (deleteError) {
          const err = deleteError as Error;
          this.logger.error(
            `Failed to delete image after task creation error: ${err.message}`,
            err.stack,
          );
        }
      }

      this.logger.error(`Failed to create task: ${err.message}`, err.stack);

      throw new HttpException(
        {
          message: 'Failed to create task',
          error: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      // Close transaction
      await queryRunner.release();
    }
  }

  async findAll(findTask: FindTaskDto): Promise<any> {
    const { user_id, project_id } = findTask;

    const user = await this.userService.findById(user_id);

    if (user.roles !== Roles.Admin) {
      const task = await this.taskRepo.find({
        where: { user: { id: user_id } },
      });
      if (!task) {
        throw new HttpException(
          {
            message: 'Task not found.',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        data: task,
        message: 'Get all task successfully.',
        statusCode: 200,
      };
    }
    if (user.roles === Roles.Admin) {
      const task = await this.taskRepo.find({
        where: { project: { id: project_id } },
      });
      if (!task) {
        throw new HttpException(
          {
            message: 'Task not found.',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        data: task,
        message: 'Get all task successfully.',
        statusCode: 200,
      };
    }
  }

  async findOne(id: number) {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new HttpException(
        {
          message: 'Task not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      data: task,
      message: 'Get task successfully.',
      statusCode: 200,
    };
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  async remove(id: number) {
    await this.findOne(id);

    const result = await this.taskRepo.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        {
          message: 'Task not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: 'Task deleted successfully.',
      statusCode: 200,
    };
  }
}
