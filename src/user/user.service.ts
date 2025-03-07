import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserData, UserRO } from './user.interface';
import { validate } from 'class-validator';
import { SECRET } from '../config';
import { LoginUserDto, UpdateUserDto } from './dto';
import * as argon2 from 'argon2';
import { Roles } from '../config/user.config';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserRO> {
    // check uniqueness of username/email
    const { username, email, password } = dto;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .orWhere('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      throw new HttpException(
        {
          message: 'Username and email must be unique.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new user
    const newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = password;
    newUser.refresh_token = this.generateRefreshToken(newUser);
    newUser.roles = Roles.User;
    newUser.created_at = new Date();

    const errors = await validate(newUser);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const savedUser = await this.userRepo.save(newUser);
      return {
        ...this.buildUserRO(savedUser),
        message: 'User created successfully',
        statusCode: 201,
      };
    }
  }

  async createAdmin(dto: CreateUserByAdminDto): Promise<UserRO> {
    // check uniqueness of username/email
    const { username, email, password, roles } = dto;
    if (
      roles !== Roles.Admin &&
      roles !== Roles.User &&
      roles !== Roles.SuperUser
    ) {
      throw new HttpException(
        {
          message: 'Roles must be Admin or User',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .orWhere('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      throw new HttpException(
        {
          message: 'Username and email must be unique.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new user
    const newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = password;
    newUser.refresh_token = this.generateRefreshToken(newUser);
    newUser.roles = roles;
    newUser.created_at = new Date();

    const errors = await validate(newUser);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const savedUser = await this.userRepo.save(newUser);
      return {
        ...this.buildUserRO(savedUser),
        message: 'User created successfully',
        statusCode: 201,
      };
    }
  }
  async findByEmail(email: string): Promise<UserRO> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...this.buildUserRO(user),
      message: 'User find  successfully',
      statusCode: 200,
    };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserRO> {
    const { roles, ...restDto } = dto; // Bỏ roles khỏi dto
    const user = await this.userRepo.findOne({ where: { id } });
    console.log(roles);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update user properties
    Object.assign(user, restDto);

    // Validate the updated user
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestException('Input data validation failed');
    }

    try {
      const updatedUser = await this.userRepo.save(user);
      // Remove password from the returned user object
      const userRO = this.buildUserRO(updatedUser);
      return {
        ...userRO,
        message: 'User updated successfully',
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async updateAdmin(
    adminId: number,
    dto: UpdateUserByAdminDto,
  ): Promise<UserRO> {
    const { id, roles } = dto;
    if (!Object.values(Roles).includes(roles)) {
      {
        throw new HttpException(
          {
            message: 'Roles must be Admin or User or SuperUser',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Update user properties
    Object.assign(user, dto);

    // Validate the updated user
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestException('Input data validation failed');
    }

    try {
      const updatedUser = await this.userRepo.save(user);
      // Remove password from the returned user object
      const userRO = this.buildUserRO(updatedUser);
      return {
        ...userRO,
        message: `User updated successfully by adminID ${adminId}`,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Error updating user ');
    }
  }

  async delete(id: number): Promise<{ message: string; statusCode: number }> {
    console.log('id', id);
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new InternalServerErrorException('Error deleting user');
    }

    return { message: 'User deleted successfully', statusCode: 200 };
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new HttpException(
        {
          message: 'User not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findIds(ids: number[]): Promise<User[]> {
    const users = await this.userRepo.findBy({ id: In(ids) });

    if (users.length !== ids.length) {
      throw new HttpException(
        {
          message: 'Some users not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return users;
  }

  async findOne({ email, password }: LoginUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  public generateAccessToken(user: User): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 1);

    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
        exp: exp.getTime() / 1000,
      },
      SECRET,
    );
  }

  public generateRefreshToken(user: User): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
        exp: exp.getTime() / 1000,
      },
      SECRET,
    );
  }

  private buildUserRO(user: User): UserRO {
    const userData: UserData = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      accessToken: this.generateAccessToken(user),
      refreshToken: user.refresh_token,
      created_at: user.created_at,
    };

    return {
      data: userData,
      statusCode: 200,
      message: 'User found',
    };
  }
}
