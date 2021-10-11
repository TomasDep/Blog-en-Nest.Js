import { CreatePostDto } from './create-post.dto';
import { PartialType, OmitType } from '@nestjs/mapped-types';

/*
  Esta linea de codigo hace que los campos del formulario de CrearPost
  no sean obligatorios
*/
export class EditPostDto extends PartialType(
  OmitType(CreatePostDto, ['slug'] as const),
) {}
