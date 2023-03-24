import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobpostModule } from './jobpost/jobpost.module';

@Module({
  imports: [JobpostModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
