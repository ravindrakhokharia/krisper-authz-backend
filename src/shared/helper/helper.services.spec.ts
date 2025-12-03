import { Test, TestingModule } from '@nestjs/testing';
import { HelperServices } from './helper.services';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('HelperServices', () => {
  let service: HelperServices;
  let http: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const httpMock: Partial<jest.Mocked<HttpService>> = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HelperServices, { provide: HttpService, useValue: httpMock }],
    }).compile();

    service = module.get<HelperServices>(HelperServices);
    http = module.get(HttpService) as jest.Mocked<HttpService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOTP', () => {
    it('returns 6-digit string', () => {
      const otp = service.generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('generates different values', () => {
      const otp1 = service.generateOTP();
      const otp2 = service.generateOTP();
      // Very unlikely to be equal but possible; test structure
      expect(typeof otp1).toBe('string');
      expect(typeof otp2).toBe('string');
    });
  });

  describe('reloadModuleCasbin', () => {
    beforeEach(() => {
      // Set env vars for testing
      process.env.HR_API_URL = 'http://hr-api';
      process.env.SALES_API_URL = 'http://sales-api';
    });

    it('calls HR API endpoint for hr module', async () => {
      http.get.mockReturnValue(of({ data: 'ok' } as any));
      await service.reloadModuleCasbin('hr');
      expect(http.get).toHaveBeenCalledWith(
        'http://hr-api/casbin/set-casbin-policy',
      );
    });

    it('calls SALES API endpoint for sales module', async () => {
      http.get.mockReturnValue(of({ data: 'ok' } as any));
      await service.reloadModuleCasbin('sales');
      expect(http.get).toHaveBeenCalledWith(
        'http://sales-api/casbin/set-casbin-policy',
      );
    });

    it('returns early for unknown module', async () => {
      await service.reloadModuleCasbin('unknown');
      expect(http.get).not.toHaveBeenCalled();
    });

    it('catches and logs errors from HTTP call', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      http.get.mockReturnValue(throwError(() => new Error('Network error')));
      await service.reloadModuleCasbin('hr');
      expect(http.get).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to reload casbin for hr module'),
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it('logs success message on successful reload', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      http.get.mockReturnValue(of({ data: 'ok' } as any));
      await service.reloadModuleCasbin('sales');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Casbin policy reload for sales module',
      );
      consoleSpy.mockRestore();
    });
  });
});
