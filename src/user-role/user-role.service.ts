import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  GRANT_TYPES,
  OAUTH_API_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from 'src/shared/constants/constant';

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
      const clientId = OAUTH_CLIENT_ID;
      const clientSecret = OAUTH_CLIENT_SECRET;

      const grantType = await firstValueFrom(
        this.httpService.get<any>(
          `${oauthApiUrl}/grant-type/${GRANT_TYPES.CLIENT_CREDENTIALS}`,
        ),
      );

      const accessToken = await firstValueFrom(
        this.httpService.post<any>(`${oauthApiUrl}/oauth/token`, {
          clientId,
          clientSecret,
          grantTypeId: grantType.data.id,
        }),
      );

      const userResponse = await firstValueFrom(
        this.httpService.post<any>(
          `${oauthApiUrl}/users/client-users-by-ids`,
          {
            ids: [createUserRoleDto.userId],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken.data.accessToken}`,
            },
          },
        ),
      );

      const user = userResponse.data[0];
      user.roles.push(userRole.role.name);

      const updatedUserResponse = await firstValueFrom(
        this.httpService.put<any>(
          `${oauthApiUrl}/users/client-user/${user.id}`,
          {
            ...user,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken.data.accessToken}`,
            },
          },
        ),
      );

      console.log('updatedUser', updatedUserResponse.data);
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            message: 'failed to assing role to user',
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
