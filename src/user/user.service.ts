import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import { CreateUserDto, EditUserDto } from './dtos';

export interface UserFindOne {
  id?: number;
  email: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async index() {
    return await this.userRepository.find();
  }

  async show(id: number, userEntity?: User) {
    const user = await this.userRepository
      .findOne(id)
      .then((u) =>
        !userEntity ? u : !!u && userEntity.id === u.id ? u : null,
      );

    if (!user)
      throw new NotFoundException(
        'No se encontro el usuario o no estas autorizado',
      );

    return user;
  }

  async create(dto: CreateUserDto) {
    const userExist = await this.userRepository.findOne({ email: dto.email });
    if (userExist)
      throw new BadRequestException(
        'El correo ingresado ya existe en nuestras bases de datos',
      );

    const newUser = this.userRepository.create(dto);
    const user = await this.userRepository.save(newUser);

    delete user.password;

    return user;
  }

  async edit(id: number, dto: EditUserDto, userEnity?: User) {
    const user = await this.show(id, userEnity);
    const editUser = Object.assign(user, dto);

    return await this.userRepository.save(editUser);
  }

  async destroy(id: number, userEnity?: User) {
    const user = await this.show(id, userEnity);

    return await this.userRepository.remove(user);
  }

  async findEmail(data: UserFindOne) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where(data)
      .addSelect('user.password')
      .getOne();
  }
}
