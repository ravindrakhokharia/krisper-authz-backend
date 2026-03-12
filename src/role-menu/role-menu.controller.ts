import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleMenuService } from './role-menu.service';
import { CreateRoleMenuDto } from './dto/create-role-menu.dto';
import { UpdateRoleMenuDto } from './dto/update-role-menu.dto';
import { QueryRoleMenuDto } from './dto/query-role-menu.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Role Menu')
@Controller('role-menu')
export class RoleMenuController {
  constructor(private readonly roleMenuService: RoleMenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRoleMenuDto: CreateRoleMenuDto) {
    return this.roleMenuService.create(createRoleMenuDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryRoleMenuDto) {
    return this.roleMenuService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.roleMenuService.findOne(id);
  }

  // @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRoleMenuDto: UpdateRoleMenuDto,
  // ) {
  //   return this.roleMenuService.update(id, updateRoleMenuDto);
  // }

  // @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  // remove(@Param('id') id: string) {
  //   return this.roleMenuService.remove(id);
  // }
}
