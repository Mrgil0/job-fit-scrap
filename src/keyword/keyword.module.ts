import { Logger, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Keyword } from '../entities/keyword.entity'
import { Stack } from '../entities/stack.entity'
import { KeywordController } from './keyword.controller'
import { KeywordService } from './keyword.service'

@Module({
    imports: [TypeOrmModule.forFeature([Keyword, Stack])],
    controllers: [KeywordController],
    providers: [KeywordService, Logger],
})
export class KeywordModule {}
