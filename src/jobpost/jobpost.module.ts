import { CacheModule, Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CompanyRepository } from 'src/company/company.repository'
import { Keyword } from 'src/entities/keyword.entity'
import { Stack } from 'src/entities/stack.entity'
import { Jobpost } from '../entities/jobpost.entity'
import { JobpostController } from './jobpost.controller'
import { JobpostRepository } from './jobpost.repository'
import { JobpostService } from './jobpost.service'
import { User } from 'src/entities/user.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Jobpost, Keyword, Stack, User])
    ],
    controllers: [JobpostController],
    providers: [
        JobpostService,
        JobpostRepository,
        CompanyRepository,
        Logger,
    ],
})
export class JobpostModule {}
