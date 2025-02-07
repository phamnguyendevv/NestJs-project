import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as argon2 from 'argon2';


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
  created_at: Date

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}
