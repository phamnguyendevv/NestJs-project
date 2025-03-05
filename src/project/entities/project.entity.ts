import { Task } from './../../task/entities/task.entity';
import { User } from './../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  project_key: string;

  @Column()
  status: string;

  @Column()
  startdate_at: Date;

  @Column()
  created_at: Date;

  @ManyToMany(() => User, (user) => user.projects)
  users: User[];

  // One-to-Many: Một Project có nhiều Task
  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
