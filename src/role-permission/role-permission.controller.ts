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
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { QueryRolePermissionDto } from './dto/query-role-permission.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Role Permission')
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryRolePermissionDto) {
    return this.rolePermissionService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.rolePermissionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    return this.rolePermissionService.update(id, updateRolePermissionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.rolePermissionService.remove(id);
  }
}
