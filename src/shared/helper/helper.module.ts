import { Module } from '@nestjs/common';
import { HelperServices } from './helper.services';
import { HttpModule } from '@nestjs/axios/dist/http.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [HelperServices],
  exports: [HelperServices],
})
export class HelperModule {}
