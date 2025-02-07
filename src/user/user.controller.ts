import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.decorator';

import {
  ApiBearerAuth, ApiTags
} from '@nestjs/swagger';
import { UserData, UserRO } from './user.interface';
import { LoginUserDto } from './dto/login-user.dto';

@ApiBearerAuth()
@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin-data')
  getAdminData(@User({ roles: ['admin', 'moderator'] }) user: UserData) {
  return { message: 'Welcome Admin/Moderator!', user };
  }

  @UsePipes(new ValidationPipe())
  @Post('users')
  async create(@Body('user') userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @Put('user')
  async update(@User({field: 'id'}) userId: number, @Body('user') userData: UpdateUserDto) {
    return await this.userService.update(userId, userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('users/login')
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserRO> {
    const _user = await this.userService.findOne(loginUserDto);

    const errors = {User: ' not found'};
    if (!_user) throw new HttpException({errors}, 401);

    const token = await this.userService.generateJWT(_user);
    const {email, username,roles} = _user;
    const user = {email, token, username,roles};
    return {user}
  }




  @Get('user')
  async findMe(@User({field: 'email'}) email: string): Promise<UserRO> {
    return await this.userService.findByEmail(email);
  }

  @Delete('users/:slug')
  async delete(@Param() params) {
    return await this.userService.delete(params.slug);
  }


}
