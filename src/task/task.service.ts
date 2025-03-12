import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { UserService } from '../user/user.service';
import { ProjectService } from '../project/project.service';
import { validate } from 'class-validator';
import { UploadService } from 'upload/upload.service';
import { FindTaskDto } from './dto/find-task.dto';
import { Roles } from 'config/user.config';
import { Status_Task } from 'config/task.config';
import { TaskData, TaskRO } from './task.interface';
import { NotificationService } from 'notification/notification.service';
import { NotificationType } from 'config/notification.config';
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly uploadService: UploadService,
    private readonly notificationService: NotificationService,
    private dataSource: DataSource,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<any> {
    console.log(createTaskDto);
    const { userId, projectId } = createTaskDto;

    createTaskDto = { ...createTaskDto, status: Status_Task.Todo };

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

    const project = await this.projectService.findOne(projectId);
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
      user: { id: userId },
      project: { id: projectId },
    });

    const errors = await validate(task);
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
      const saveTask = await this.taskRepo.save(task);
      await this.notificationService.create(
        NotificationType.TASK_CREATED,
        `Task ${saveTask.title} has been created.`,
        saveTask.id.toString(),
      );
      return {
        message: 'Task created successfully.',
        data: saveTask,
        statusCode: 200,
      };
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

  async findOne(id: number): Promise<TaskRO> {
    try {
      // Cách 1: Sử dụng relations - đơn giản và hiệu quả hơn
      const task = await this.taskRepo.findOne({
        where: { id },
        relations: ['user', 'project'],
        select: {
          user: { id: true },
          project: { id: true },
        },
      });

      if (!task) {
        throw new HttpException(
          {
            message: 'Task not found.',
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Chuyển đổi dữ liệu để phù hợp với định dạng mong muốn
      const response = {
        ...task,
        userId: task.user?.id,
        projectId: task.project?.id,
      } as TaskData;

      // Xóa các thuộc tính không cần thiết nếu muốn
      delete response.user;
      delete response.project;

      return {
        data: response,
        message: 'Get task successfully.',
        statusCode: 200,
      };
    } catch (error) {
      // Xử lý lỗi chung
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'An error occurred while fetching the task.',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const taskRO = await this.findOne(id);
    const task = taskRO.data;

    if (!task) {
      throw new HttpException(
        { message: 'Task not found.', statusCode: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }
    // Check if the user exists (optional if userId is updatable)
    if (updateTaskDto.userId) {
      const user = await this.userService.findById(updateTaskDto.userId);
      if (!user) {
        throw new HttpException(
          { message: 'User not found.', statusCode: HttpStatus.BAD_REQUEST },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate and update fields
    task.title = updateTaskDto.title ?? task.title;
    task.descriptionText =
      updateTaskDto.descriptionText ?? task.descriptionText;
    task.descriptionImage =
      updateTaskDto.descriptionImage ?? task.descriptionImage;
    task.status = updateTaskDto.status ?? task.status;

    // Ensure valid date formats
    if (updateTaskDto.startDate) {
      const parsedStartDate = new Date(updateTaskDto.startDate);
      if (!isNaN(parsedStartDate.getTime())) {
        task.startDate = parsedStartDate;
      }
    }

    if (updateTaskDto.endDate) {
      const parsedEndDate = new Date(updateTaskDto.endDate);
      if (!isNaN(parsedEndDate.getTime())) {
        task.endDate = parsedEndDate;
      }
    }
    // Save the updated task
    const saveTask = await this.taskRepo.save(task);

    await this.notificationService.create(
      NotificationType.TASK_UPDATED,
      `Task ${saveTask.title} has been updated.`,
      saveTask.id.toString(),
    );

    return {
      message: 'Task updated successfully.',
      statusCode: 200,
      data: task,
    };
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

    await this.notificationService.create(
      NotificationType.TASK_DELETED,
      `Task ${id} has been deleted.`,
      id.toString(),
    );
    return {
      message: 'Task deleted successfully.',
      statusCode: 200,
    };
  }

  private buildTaskRO(task: Task): TaskRO {
    const taskData: TaskData = {
      id: task.id,
      title: task.title,
      descriptionText: task.descriptionText,
      descriptionImage: task.descriptionImage,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      userId: task.user.id,
      projectId: task.project.id,
    };

    return {
      data: taskData,
      message: 'Task find successfully',
      statusCode: 200,
    };
  }
}
