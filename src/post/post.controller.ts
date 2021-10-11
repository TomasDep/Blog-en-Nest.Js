import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesBuilder, InjectRolesBuilder } from 'nest-access-control';

import { PostService } from './post.service';
import { CreatePostDto, EditPostDto } from './dtos';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from 'src/user/entities';
import { AppResource } from '../app.roles';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(
    private readonly PostService: PostService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Get()
  async index() {
    const data = await this.PostService.index();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get(':id')
  show(@Param('id', ParseIntPipe) id: number) {
    /* console.log(typeof id); */
    return this.PostService.show(id);
  }

  @Auth({
    resource: AppResource.POST,
    action: 'create',
    possession: 'own',
  })
  @Post()
  async create(@Body() dto: CreatePostDto, @User() author: UserEntity) {
    const data = await this.PostService.create(dto, author);

    return { message: 'Post creado', data };
  }

  @Auth({
    resource: AppResource.POST,
    action: 'update',
    possession: 'own',
  })
  @Put(':id')
  async edit(
    @Param('id') id: number,
    @Body() dto: EditPostDto,
    @User() author: UserEntity,
  ) {
    let data;

    if (
      this.rolesBuilder.can(author.roles).updateAny(AppResource.POST).granted
    ) {
      // Puede editar cualquier Post
      data = await this.PostService.edit(id, dto);
    }
    {
      // Puede editar solo Post propios
      data = await this.PostService.edit(id, dto, author);
    }
    return { message: 'Post editado', data };
  }

  @Auth({
    resource: AppResource.POST,
    action: 'delete',
    possession: 'own',
  })
  @Delete(':id')
  async destroy(@Param('id') id: number, @User() author: UserEntity) {
    let data;

    if (
      this.rolesBuilder.can(author.roles).deleteAny(AppResource.POST).granted
    ) {
      // Puede eliminar cualquier Post
      data = await this.PostService.destroy(id);
    }
    {
      // Puede eliminar solo Post propios
      data = await this.PostService.destroy(id, author);
    }
    return { message: 'Post eliminado', data };
  }
}
