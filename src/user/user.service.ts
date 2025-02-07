import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
const jwt = require('jsonwebtoken');
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRO } from './user.interface';
import { validate } from 'class-validator';
const SECRET = "Nguyendeptrai"
import { omit } from 'lodash';
import { LoginUserDto } from './dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserRO> {

    // check uniqueness of username/email
    const {username, email, password, created_at} = dto;

  
      const qb = this.userRepo.createQueryBuilder('user')
        .where('user.username = :username', { username })
        .orWhere('user.email = :email', { email });
  
        const user = await qb.getOne();
      

    if (user) {
      const errors = {username: 'Username and email must be unique.'};
      throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);

    }

    // create new user
    let newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = password;
    newUser.created_at = created_at;

    const errors = await validate(newUser);
    if (errors.length > 0) {
      const _errors = {username: 'Userinput is not valid.'};
      throw new HttpException({message: 'Input data validation failed', _errors}, HttpStatus.BAD_REQUEST);

    } else {
      const savedUser = await this.userRepo.save(newUser);
      return this.buildUserRO(savedUser);
    }

  }

  async findByEmail(email: string): Promise<UserRO>{
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.buildUserRO(user);
  }


  async update(id: number, dto: UpdateUserDto): Promise<User> {
    let toUpdate = await this.userRepo.findOne({ where: { id } });
  
    if (!toUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const sanitizedUser = omit(toUpdate, ['password']);
    let updated = Object.assign(sanitizedUser, dto);

    return await this.userRepo.save(updated);
  }
  async delete(email: string): Promise<DeleteResult> {
    return await this.userRepo.delete({ email: email});
  }

  async findById(id: number): Promise<UserRO>{
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      const errors = {User: ' not found'};
      throw new HttpException({errors}, 401);
    }

    return this.buildUserRO(user);
  }

  async findOne({ email, password }: LoginUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
  
    return user;
  }

  


  public generateJWT(user) {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      exp: exp.getTime() / 1000,
    }, SECRET);
  };

  private buildUserRO(user: User) {
    const userRO = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      token: this.generateJWT(user),
    };
    return {user: userRO};
  }
}
