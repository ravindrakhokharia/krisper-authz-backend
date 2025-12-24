import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User Role')
@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post()
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRoleService.create(createUserRoleDto);
  }

  @Get()
  findAll(@Query() query: QueryUserRoleDto) {
    return this.userRoleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRoleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userRoleService.update(id, updateUserRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRoleService.remove(id);
  }
}
