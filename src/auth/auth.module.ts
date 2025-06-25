import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    UserModule, // still needed for UserService
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅ this is what you’re missing
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export default class AuthModule {}
