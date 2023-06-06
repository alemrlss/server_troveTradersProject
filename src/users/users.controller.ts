import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostsService } from 'src/posts/posts.service';
import { Users } from './schema/users.schema';

@ApiTags('Users')
@Controller('users')
//@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // return all users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // return user by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //return posts by id(retorna los posts de el id pasado en cuestion)
  @Get(':id/posts')
  findPostById(@Param('id') id: string) {
    return this.usersService.findPostById(id);
  }
  /* 


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  */
}
