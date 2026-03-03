import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
