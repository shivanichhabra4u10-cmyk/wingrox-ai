import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaService } from './common/prisma.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TwinAssessmentModule } from './modules/twin-assessment/twin-assessment.module';
import { ExpansionModule } from './modules/expansion/expansion.module';
import { MatchModule } from './modules/match/match.module';
import { HubModule } from './modules/hub/hub.module';
import { SimModule } from './modules/sim/sim.module';
import { EcoModule } from './modules/eco/eco.module';

const jwtExpiration = process.env.JWT_EXPIRATION ?? '24h';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: jwtExpiration as any },
    }),
    AuthModule,
    UsersModule,
    DashboardModule,
    AccountsModule,
    ReportsModule,
    TwinAssessmentModule,
    ExpansionModule,
    MatchModule,
    HubModule,
    SimModule,
    EcoModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
