import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Keyword } from '../entities/keyword.entity'
import { Stack } from '../entities/stack.entity'
import { Repository } from 'typeorm'

@Injectable()
export class KeywordService {
    constructor(
        @InjectRepository(Keyword)
        private keywordRepository: Repository<Keyword>,
        @InjectRepository(Stack) private stackRepository: Repository<Stack>,
        private logger: Logger
    ) {}

    async postKeywords(keywords: { keyword: string; keywordCode: number }[]) {
        await this.keywordRepository.save(keywords)
    }

    async postStacks(
        stacks: { stack: string; category: string; stackImgUrl: string }[]
    ) {
        await this.stackRepository.save(stacks)
    }
}
