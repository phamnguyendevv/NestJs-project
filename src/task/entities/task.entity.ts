import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './../../user/entities/user.entity';
import { Project } from './../../project/entities/project.entity';
import { Comment } from './../../comment/entities/comment.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: 'No description provided' })
  descriptionText: string;

  @Column('simple-array', { nullable: true })
  descriptionImage: string[];

  @Column()
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Thiết lập quan hệ Many-to-One với User
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Thiết lập quan hệ Many-to-One với Project
  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  // Thiết lập quan hệ One-to-Many với Comment
  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
