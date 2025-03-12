import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notification.gateway';
import { TaskService } from './../task/task.service';
import { UserService } from './../user/user.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway, // Inject Gateway
    @Inject(forwardRef(() => TaskService)) private taskService: TaskService,
    private userService: UserService,
  ) {}
  async create(
    type: NotificationType,
    message: string,
    entityId?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      type,
      message,
      entityId,
      read: false,
    });

    const savedNotification =
      await this.notificationsRepository.save(notification);

    const taskId = entityId ? Number(entityId) : null;
    if (!taskId) {
      return savedNotification;
    }
    const task = await this.taskService.findOne(taskId);
    if (task && task.data.userId) {
      const user = await this.userService.findById(task.data.userId);

      if (user) {
        // Kiểm tra tránh gọi đệ quy vô hạn
        if (type !== NotificationType.TASK_CREATED) {
          await this.create(
            NotificationType.TASK_CREATED,
            `Bạn có một công việc mới: ${task.data.title}`,
            user.id.toString(),
          );
        }
        this.notificationsGateway.sendNotificationToUser(user.id.toString(), {
          ...savedNotification,
          message: `Bạn có một công việc mới: ${task.data.title}`,
        });
      }
    }

    return savedNotification;
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findUnread(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { read: false },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new HttpException(
        {
          message: 'Notification not found.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    notification.read = true;

    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('read = :read', { read: false })
      .execute();
  }
}
