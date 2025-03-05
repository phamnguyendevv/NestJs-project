import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpCode,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserByAdminDto, CreateUserDto } from './dto/create-user.dto';
import { User } from './user.decorator';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRO } from './user.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto';
import { UpdateUserByAdminDto } from './dto/update-user.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('admin/register')
  async createAdmin(@Body('user') userData: CreateUserByAdminDto) {
    return this.userService.createAdmin(userData);
  }

  @UsePipes(new ValidationPipe())
  @Put('admin')
  async updateAdmin(
    @User({ field: 'id', roles: ['Admin'] }) userId: number,
    @Body('user') userData: UpdateUserByAdminDto,
  ) {
    return await this.userService.updateAdmin(userId, userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('users/register')
  async create(@Body('user') userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @UsePipes(new ValidationPipe())
  @Put('users')
  async update(
    @User({ field: 'id' }) userId: number,
    @Body('user') userData: UpdateUserDto,
  ) {
    return await this.userService.update(userId, userData);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('users/login')
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserRO> {
    const _user = await this.userService.findOne(loginUserDto);

    const errors = { User: ' not found' };
    if (!_user) throw new HttpException({ errors }, 401);

    const accessToken = this.userService.generateAccessToken(_user);

    const { email, username, roles } = _user;
    const user = {
      email,
      username,
      roles,
      accessToken: accessToken,
      refreshToken: _user.refresh_token,
      created_at: _user.created_at,
    };
    return { data: user, message: 'Login Success!', statusCode: 200 };
  }

  @Get('users')
  async findMe(@User({ field: 'email' }) email: string): Promise<UserRO> {
    return await this.userService.findByEmail(email);
  }

  @Delete('users/:slug')
  async delete(@Param('slug') slug: number) {
    return await this.userService.delete(slug);
  }
}
