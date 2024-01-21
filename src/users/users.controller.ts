import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { IUser } from './users.interface';

@Controller('users') // => /users
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage('Create a new user')
  createNewAccount(@Body() createNewUser: CreateUserDto) {
    return this.usersService.createAUser(createNewUser);
  }

  @Get()
  @ResponseMessage("Get users with paginate")
  fetchUser(
    @Query('current') currentPage,
    @Query('pageSize') limits,
    @Query() qs
  ) {
    return this.usersService.fetchUserWithPaginate(+currentPage, +limits, qs);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a user')
  update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a user')
  deleteAUser(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.deleteAUser(id, user);
  }
}
