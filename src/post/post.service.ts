import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Post } from './entities';
import { CreatePostDto, EditPostDto } from './dtos';
import { User } from 'src/user/entities';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async index(): Promise<Post[]> {
    return await this.postRepository.find();
  }

  async show(id: number, author?: User) {
    const post = await this.postRepository
      .findOne(id)
      .then((p) => (!author ? p : !!p && author.id === p.author.id ? p : null));

    if (!post)
      throw new NotFoundException('El post no existe o no estas autorizado');

    return post;
  }

  async create(dto: CreatePostDto, author: User) {
    const post = this.postRepository.create({ ...dto, author });

    return await this.postRepository.save(post);
  }

  async edit(id: number, dto: EditPostDto, author?: User) {
    const post = await this.show(id, author);
    const editPost = Object.assign(post, dto);

    return await this.postRepository.save(editPost);
  }

  async destroy(id: number, author?: User) {
    const post = await this.show(id, author);

    return await this.postRepository.remove(post);
  }
}
