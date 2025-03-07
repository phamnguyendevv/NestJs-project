import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectData, ProjectRO } from './project.interface';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Status_Project } from '../config/project.config';
import { UpdateUserProjectDto } from './dto/update-user-project';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly userService: UserService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectRO> {
    const { owner_id, name, description, status, project_key } =
      createProjectDto;

    await this.userService.findById(owner_id);

    const project = await this.projectRepo.findOne({
      where: { project_key },
    });
    if (project) {
      throw new HttpException(
        {
          message: 'Project key must be unique.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Object.values(Status_Project).includes(status)) {
      {
        throw new HttpException(
          {
            message: 'Status must be Active, Inactive, Cancelled or Completed',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const newProject = new Project();
    newProject.owner_id = owner_id;
    newProject.name = name;
    newProject.description = description;
    newProject.status = status;
    newProject.project_key = project_key;
    newProject.startdate_at = new Date();
    newProject.created_at = new Date();

    const errors = await validate(newProject);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Validation failed',
          errors: errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const savedProject = await this.projectRepo.save(newProject);
      return {
        ...this.buildProjectRO(savedProject),
        message: 'Project created successfully',
        statusCode: 201,
      };
    }
  }

  findAll() {
    return `This action returns all project`;
  }

  async findOne(id: number): Promise<ProjectRO> {
    const project = await this.projectRepo.findOne({
      where: { id },
    });

    const users = await this.projectRepo
      .createQueryBuilder('project')
      .relation('users')
      .of(id)
      .loadMany();

    const userIds = users?.map((user: User) => user.id) || [];

    if (!project) {
      throw new HttpException(
        {
          message: 'Project not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        project_key: project.project_key,
        userIds,
        startdate_at: project.startdate_at,
        created_at: project.created_at,
      },
      message: 'Project find successfully',
      statusCode: 200,
    };
  }

  async update(id: number, UpdateProjectDto: UpdateProjectDto) {
    const { owner_id, project_key } = UpdateProjectDto;
    const project = await this.projectRepo.findOne({ where: { owner_id, id } });
    if (!project) {
      throw new HttpException(
        {
          message: 'Project not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (project_key && project_key !== project.project_key) {
      const projectKey = await this.projectRepo.findOne({
        where: { project_key },
      });
      if (projectKey) {
        throw new HttpException(
          {
            message: 'Project key must be unique.',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    Object.assign(project, UpdateProjectDto);

    const errors = await validate(project);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Validation failed',
          errors: errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const savedProject = await this.projectRepo.save(project);
      return {
        ...this.buildProjectRO(savedProject),
        message: 'Project updated successfully',
        statusCode: 200,
      };
    }
  }

  async addUsersToProject(
    projectId: number,
    dto: UpdateUserProjectDto,
  ): Promise<ProjectRO> {
    const { userIds, owner_id } = dto;
    const project = await this.projectRepo.findOne({
      where: { id: projectId, owner_id },
      relations: ['users'],
    });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    await this.userService.findIds(userIds);

    // Lấy danh sách userId đã tồn tại trong project
    const existingUserIds = new Set(project.users.map((user) => user.id));
    // Lọc ra những userId chưa có trong project
    const newUserIds = userIds.filter((id) => !existingUserIds.has(id));
    if (newUserIds.length === 0) {
      return {
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          project_key: project.project_key,
          startdate_at: project.startdate_at,
          created_at: project.created_at,
          userIds: Array.from(existingUserIds),
        },
        message:
          'No new users added. All provided users already exist in the project.',
        statusCode: 200,
      };
    }

    // Cập nhật trực tiếp bảng trung gian (không cần lấy toàn bộ user objects)
    await this.projectRepo
      .createQueryBuilder()
      .relation(Project, 'users')
      .of(projectId)
      .add(newUserIds);

    return {
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        project_key: project.project_key,
        startdate_at: project.startdate_at,
        created_at: project.created_at,
        userIds: [...existingUserIds, ...newUserIds],
      },
      message: 'Users added to project successfully',
      statusCode: 200,
    };
  }
  async removeUsersFromProject(
    projectId: number,
    dto: UpdateUserProjectDto,
  ): Promise<ProjectRO> {
    const { userIds, owner_id } = dto;
    const project = await this.projectRepo.findOne({
      where: { id: projectId, owner_id },
      relations: ['users'],
    });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    await this.userService.findIds(userIds);

    // Lấy danh sách userId đã tồn tại trong project
    const existingUserIds = new Set(project.users.map((user) => user.id));
    // Lọc ra những userId không có trong project
    const removeUserIds = userIds.filter((id) => existingUserIds.has(id));
    if (removeUserIds.length === 0) {
      return {
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          project_key: project.project_key,
          startdate_at: project.startdate_at,
          created_at: project.created_at,
          userIds: Array.from(existingUserIds),
        },
        message:
          'No users removed. All provided users do not exist in the project.',
        statusCode: 200,
      };
    }

    // Cập nhật trực tiếp bảng trung gian (không cần lấy toàn bộ user objects)
    await this.projectRepo
      .createQueryBuilder()
      .relation(Project, 'users')
      .of(projectId)
      .remove(removeUserIds);

    return {
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        project_key: project.project_key,
        startdate_at: project.startdate_at,
        created_at: project.created_at,
        userIds: Array.from(existingUserIds).filter(
          (id) => !removeUserIds.includes(id),
        ),
      },
      message: 'Users removed from project successfully',
      statusCode: 200,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
  private buildProjectRO(project: Project): ProjectRO {
    const projectData: ProjectData = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      project_key: project.project_key,
      startdate_at: project.startdate_at,
      created_at: project.created_at,
    };
    return {
      data: projectData,
      message: 'Project created successfully',
      statusCode: 201,
    };
  }
}
