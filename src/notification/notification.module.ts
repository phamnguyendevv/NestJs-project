import { forwardRef, Logger, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsGateway } from './notification.gateway';
import { Notification } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from './../task/task.module';
import { UserModule } from './../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => TaskModule),
    UserModule,
  ],
  providers: [NotificationService, NotificationsGateway, Logger],
  exports: [NotificationService],
})
export class NotificationModule {}
