import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { JobpostModule } from './jobpost/jobpost.module';
import { TypeOrmConfigService } from './_config/typeorm.config.service'
import { KeywordModule } from './keyword/keyword.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useClass: TypeOrmConfigService,
        inject: [ConfigService],
    }),JobpostModule,CompanyModule
    ,KeywordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
