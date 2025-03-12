import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './user/entities/user.entity';
import { Project } from './project/entities/project.entity';
import { Task } from './task/entities/task.entity';
import { Comment } from './comment/entities/comment.entity';
import { Notification } from './notification/entities/notification.entity';

config(); // Load biến môi trường từ .env

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [User, Project, Task, Comment, Notification],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
});

// Thêm phương thức kết nối
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
