import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { UserService } from './user.service';
import { CreateUserDto, EditUserDto, UserRegistrationDto } from './dtos';
import { Auth, User } from 'src/common/decorators';
import { AppResource, AppRoles } from '../app.roles';
import { User as UserEntity } from 'src/user/entities';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Get()
  async index() {
    const data = await this.userService.index();

    return { data };
  }

  @Post('register')
  async publicRegistration(@Body() dto: UserRegistrationDto) {
    const data = await this.userService.create({
      ...dto,
      roles: [AppRoles.AUTHOR],
    });

    return { message: 'Usuario registrado', data };
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    const data = await this.userService.show(id);

    return { data };
  }

  @Auth({
    possession: 'any',
    action: 'create',
    resource: AppResource.USER,
  })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.userService.create(dto);

    return { message: 'Usuario creado', data };
  }

  @Auth({
    possession: 'own',
    action: 'update',
    resource: AppResource.USER,
  })
  @Put(':id')
  async edit(
    @Param('id') id: number,
    @Body() dto: EditUserDto,
    @User() user: UserEntity,
  ) {
    let data;

    if (this.rolesBuilder.can(user.roles).updateAny(AppResource.USER).granted) {
      // Esto es un administrador
      data = await this.userService.edit(id, dto);
      //console.log('ADMINISTRADOR');
    } else {
      // Esto es un author
      const { roles, ...rest } = dto;
      data = await this.userService.edit(id, rest, user);
      //console.log('AUTHOR');
    }

    return { message: 'Usuario actualizado', data };
  }

  @Auth({
    action: 'delete',
    possession: 'own',
    resource: AppResource.USER,
  })
  @Delete(':id')
  async destroy(@Param('id') id: number, @User() user: UserEntity) {
    let data;

    if (this.rolesBuilder.can(user.roles).updateAny(AppResource.USER).granted) {
      // Esto es un administrador
      data = await this.userService.destroy(id);
    } else {
      // Esto es un author
      data = await this.userService.destroy(id, user);
    }

    return { message: 'Usuario eliminado', data };
  }
}
