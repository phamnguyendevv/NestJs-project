import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './../../user/entities/user.entity';
import { Project } from './../../project/entities/project.entity';

export enum ImageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  imageThumbnailUrl: string;

  @Column({ nullable: true })
  imagePublicId: string;

  @Column({
    type: 'enum',
    enum: ImageStatus,
    default: ImageStatus.PENDING,
    nullable: true,
  })
  imageStatus: ImageStatus;

  @Column({ nullable: true })
  imageError: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  // Thiết lập quan hệ Many-to-One với User
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Thiết lập quan hệ Many-to-One với Project
  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
