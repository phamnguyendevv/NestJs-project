import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(
    FileInterceptor('image', {
      // "images" là key trong request, tối đa 5 files
      limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi ảnh
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFile() file?: Express.Multer.File, // Upload nhiều file
  ) {
    if (file) {
      return this.taskService.createWithImages(createTaskDto, file);
    }
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
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
