import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Project } from './../../project/entities/project.entity';
import { Task } from './../../task/entities/task.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  roles: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  password: string;

  @Column()
  refresh_token: string;

  @Column()
  created_at: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @ManyToMany(() => Project, (project) => project.users)
  @JoinTable({ name: 'user_project' })
  projects: Project[];

  // One-to-Many: Một User có nhiều Task
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
