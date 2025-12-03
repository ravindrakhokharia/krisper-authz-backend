import { BadRequestException, Injectable } from '@nestjs/common';
import { errorMessages } from '../constants/error-messages';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ValidationService {
  constructor(private prisma: PrismaService) {}

  async validateReference(model: string, id: number | string) {
    if (!id) return;

    const record = await this.prisma[model]?.findUnique({
      where: { id },
    });

    if (!record) {
      throw new BadRequestException(
        `${this.capitalize(model)} ${errorMessages.INVALID_ID}`,
      );
    }

    return record;
  }

  async validateReferences(references: Record<string, number | string>) {
    const results: Record<string, any> = {};

    for (const [key, value] of Object.entries(references)) {
      const model = key.replace(/Id$/, '');
      results[model] = await this.validateReference(model, value);
    }

    return results;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
