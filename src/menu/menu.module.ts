import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { HelperModule } from 'src/shared/helper/helper.module';

@Module({
  imports: [HelperModule, HttpModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
