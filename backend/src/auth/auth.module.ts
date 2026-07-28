import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

export const JWT_SECRET_FALLBACK = 'your-super-secret-key';
export const getJwtSecret = (configService: ConfigService): string => {
  const v = configService?.get?.('JWT_SECRET');
  if (typeof v === 'string' && v.length > 0) return v;
  const env = typeof process !== 'undefined' ? (process.env?.JWT_SECRET as string | undefined) : undefined;
  if (typeof env === 'string' && env.length > 0) return env;
  return JWT_SECRET_FALLBACK;
};
export const getJwtExpiresIn = (configService: ConfigService): string => {
  const v = configService?.get?.('JWT_EXPIRY') ?? configService?.get?.('JWT_EXPIRES_IN');
  if (typeof v === 'string' && v.length > 0) return v;
  const env = typeof process !== 'undefined' ? (process.env?.JWT_EXPIRY as string | undefined) ?? (process.env?.JWT_EXPIRES_IN as string | undefined) : undefined;
  if (typeof env === 'string' && env.length > 0) return env;
  return '1d';
};

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: getJwtSecret(configService),
        signOptions: { expiresIn: getJwtExpiresIn(configService) },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
