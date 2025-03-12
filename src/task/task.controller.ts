import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { FindTaskDto } from './dto/find-task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // @Post()
  // create(@Body('task') createTaskDto: CreateTaskDto) {
  //   return this.taskService.create(createTaskDto);
  // }
  @Post()
  @ApiOperation({ summary: 'Create a new task (with or without image)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        completed: { type: 'boolean' },
        image: {
          type: 'string',
          format: 'binary',
          nullable: true, // Không bắt buộc
        },
      },
      required: ['title'],
    },
  })
  createTask(@Body('task') createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get('getAll')
  findAll(@Body('task') findTask: FindTaskDto) {
    return this.taskService.findAll(findTask);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('task') updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
