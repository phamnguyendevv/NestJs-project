import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserProjectDto } from './dto/update-user-project';

@ApiBearerAuth()
@ApiTags('projects')
@UsePipes(new ValidationPipe())
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body('project') createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('project') updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Post(':projectId/add-users')
  async addUsersToProject(
    @Param('projectId') projectId: number,
    @Body('project') addUsersToProject: UpdateUserProjectDto,
  ) {
    return await this.projectService.addUsersToProject(
      projectId,
      addUsersToProject,
    );
  }

  @Post(':projectId/remove-users')
  async removeUsersFromProject(
    @Param('projectId') projectId: number,
    @Body('project') removeUsersFromProject: UpdateUserProjectDto,
  ) {
    return await this.projectService.removeUsersFromProject(
      projectId,
      removeUsersFromProject,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
  @Get()
  findAll() {
    return this.projectService.findAll();
  }
}
