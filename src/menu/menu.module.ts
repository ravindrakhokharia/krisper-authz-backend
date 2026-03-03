import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { HelperModule } from 'src/shared/helper/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
