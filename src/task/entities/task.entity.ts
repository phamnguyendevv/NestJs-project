import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './../../user/entities/user.entity';
import { Project } from './../../project/entities/project.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  user_id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  status: string;

  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  project_id: number;

  // Thiết lập quan hệ Many-to-One với User
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User;

  // Thiết lập quan hệ Many-to-One với Project
  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  project: Project;
}
