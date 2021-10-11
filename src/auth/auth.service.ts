import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from 'src/user/entities';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';
import { response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findEmail({ email });

    if (user && (await compare(password, user.password))) {
      const { password, ...rest } = user;

      return rest;
    }

    return null;
  }

  login(user: User) {
    const { id, ...rest } = user;
    const payload = { sub: id };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
