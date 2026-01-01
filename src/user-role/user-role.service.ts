import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { OAUTH_API_URL } from 'src/shared/constants/constant';

@Injectable()
export class UserRoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly validationService: ValidationService,
  ) {}
  async create(createUserRoleDto: CreateUserRoleDto) {
    await this.validationService.validateReferences({
      roleId: createUserRoleDto.roleId,
    });

    const userRole = await this.prisma.userRole.create({
      data: createUserRoleDto,
      include: { role: true },
    });

    try {
      const oauthApiUrl = OAUTH_API_URL;

      const userResponse = await firstValueFrom(
        this.httpService.get<any>(
          `${oauthApiUrl}/users/${createUserRoleDto.userId}`,
        ),
      );

      const user = userResponse.data;
      user.roles.push(userRole.role.name);

      await firstValueFrom(
        this.httpService.put<any>(`${oauthApiUrl}/users/${user.id}`, {
          ...user,
        }),
      );
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            message: 'Failed to assign role to user',
            error: error.response?.data,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }

    return userRole;
  }

  async findAll(query: QueryUserRoleDto) {
    const { userId, roleId, limit = 100, offset = 0 } = query;
    const whereClause: Record<string, any> = {};

    if (userId) {
      whereClause.userId = userId;
    }
    if (roleId) {
      whereClause.roleId = roleId;
    }

    const userRole = await this.prisma.userRole.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });
    return userRole;
  }

  findOne(id: string) {
    const userRole = this.prisma.userRole.findUnique({
      where: { id },
    });
    return userRole;
  }

  update(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    return `This action updates a #${id} rolePermission`;
  }

  remove(id: string) {
    return `This action removes a #${id} rolePermission`;
  }
}
