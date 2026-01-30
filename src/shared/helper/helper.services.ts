import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable()
export class HelperServices {
  constructor(private readonly httpService: HttpService) {}
  generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  async reloadModuleCasbin(moduleName: string) {
    const moduleEndpoints = {
      hr: process.env.HR_API_URL,
      sales: process.env.SALES_API_URL,
    };

    const baseUrl = moduleEndpoints[moduleName];

    if (!baseUrl) {
      console.warn(`No API endpoint configured for module: ${moduleName}`);
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.get(`${baseUrl}/casbin/set-casbin-policy`),
      );

      console.log(`Casbin policy reload for ${moduleName} module`);
    } catch (error) {
      console.error(`Failed to reload casbin for ${moduleName} module `, error);
    }
  }

  capitalize(value?: string): string {
    if (!value) return '';

    return value
      .trim()
      .split('-')
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '',
      )
      .join('-');
  }
}
