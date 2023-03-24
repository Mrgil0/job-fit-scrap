import { DataSource, Repository } from 'typeorm'
import { Jobpost } from 'src/entities/jobpost.entity'
import { Injectable } from '@nestjs/common'
import { CompanyRepository } from 'src/company/company.repository'
import { Keyword } from 'src/entities/keyword.entity'
import { Stack } from 'src/entities/stack.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { default as keywords } from '../resources/data/parsing/keywordsForParsing.json'
import { default as stacks } from '../resources/data/parsing/stacksForParsing.json'

@Injectable()
export class JobpostRepository extends Repository<Jobpost> {
    constructor(
        private dataSource: DataSource,
        private companyRepository: CompanyRepository,
        @InjectRepository(Stack) private stackRepository: Repository<Stack>,
        @InjectRepository(Keyword)
        private keywordRepository: Repository<Keyword>,
    ) {
        super(Jobpost, dataSource.createEntityManager())
    }

    async createJobposts(jobposts) {
        // 공고 데이터 한번씩 돌면서
        for (let jobpost of jobposts) {
            const {
                companyName,
                title,
                content,
                salary,
                originalSiteName,
                originalUrl,
                originalImgUrl,
                postedDtm,
                deadlineDtm,
                originalAddress,
                addressUpper,
                addressLower,
                longitude,
                latitude,
            } = jobpost

            // 회사 id 들고오는 쿼리
            const companyId = await this.companyRepository.findCompanyId(
                companyName
            )

            const { keywords, stacks } = await this.keywordParser(
                title,
                content
            )

            const createdJobpost = await this.createQueryBuilder('jobpost')
                .insert()
                .into('jobpost')
                .values({
                    companyId,
                    title,
                    content,
                    salary,
                    originalSiteName,
                    originalUrl,
                    originalImgUrl,
                    postedDtm,
                    deadlineDtm,
                    originalAddress,
                    addressUpper,
                    addressLower,
                    longitude,
                    latitude,
                })
                .orUpdate(
                    ['salary', 'original_img_url', 'deadline_dtm'],
                    ['company_id', 'title']
                )
                .updateEntity(false)
                .execute()

            if (
                createdJobpost.raw.insertId !== 0 &&
                createdJobpost.raw.affectedRows === 1
            ) {
                await this.createQueryBuilder()
                    .relation(Jobpost, 'keywords')
                    .of({ jobpostId: createdJobpost.raw.insertId })
                    .add(keywords)

                await this.createQueryBuilder()
                    .relation(Jobpost, 'stacks')
                    .of({ jobpostId: createdJobpost.raw.insertId })
                    .add(stacks)
            }
        }
    }
    async keywordParser(title: string, content: string | object) {
        const contentKeywords = []
        const contentStacks = []

        if (typeof content === 'object') content = JSON.stringify(content)
        content = title + ' ' + content

        for (let i = 0; i < keywords.length; i++) {
            if (keywords[i].excludes) {
                for (let k = 0; k < keywords[i].excludes.length; k++) {
                    content = content.replaceAll(keywords[i].excludes[k], '')
                }
            }

            for (let j = 0; j < keywords[i].keyword.length; j++) {
                const re = new RegExp(`${keywords[i].keyword[j]}`, 'gi')
                if (re.test(content)) {
                    const keyword = await this.keywordRepository.findOne({
                        where: { keywordCode: keywords[i].keywordCode },
                    })
                    contentKeywords.push(keyword)
                    break
                }
            }
        }

        for (let i = 0; i < stacks.length; i++) {
            for (let j = 0; j < stacks[i].stack.length; j++) {
                if (stacks[i].excludes) {
                    for (let k = 0; k < stacks[i].excludes.length; k++) {
                        content = content.replaceAll(stacks[i].excludes[k], '')
                    }
                }

                const regExVar = stacks[i].stack[j].replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )
                const re = new RegExp(`\\b${regExVar}\\b`, 'gi')
                if (re.test(content)) {
                    const stack = await this.stackRepository.findOne({
                        where: { stack: stacks[i].stack[0] },
                    })
                    if (stack === null) console.warn(stacks[i])
                    contentStacks.push(stack)
                    break
                }
            }
        }

        return { keywords: contentKeywords, stacks: contentStacks }
    }
    async getAddresses() {
        const todayDate = new Date(Date.now())

        const where = `AND j.updated_dtm > '${todayDate.getFullYear()}-${
            todayDate.getMonth() + 1
        }-${todayDate.getDate() - 1}'`

        const addressUpper = await this.query(`select address_upper
                                                from jobpost j
                                                where address_upper is not null ${where}
                                                group by address_upper 
                                                order by address_upper asc`)

        const addressLower = await this
            .query(`select address_upper, address_lower
                    from jobpost j 
                    where address_lower is not null and address_upper is not null ${where}
                    group by address_lower 
                    order by address_upper asc, address_lower asc`)

        return { addressUpper, addressLower }
    }

    async getStacks() {
        const todayDate = new Date(Date.now())

        const where = `AND j.updated_dtm > '${todayDate.getFullYear()}-${
            todayDate.getMonth() + 1
        }-${todayDate.getDate() - 1}'`

        return await this.query(`select j2.stack, j2.category
                                from jobpost j
                                left join (select j.stack_id, j.jobpost_id, stack, category
                                from jobpoststack j 
                                left join stack s on j.stack_id = s.stack_id) j2 on j.jobpost_id = j2.jobpost_id
                                where j2.stack is not null ${where}
                                group by j2.stack
                                order by j2.category asc, j2.stack asc`)
    }
    async getKeywords() {
        const todayDate = new Date(Date.now())

        const where = `WHERE jp.updated_dtm > '${todayDate.getFullYear()}-${
            todayDate.getMonth() + 1
        }-${todayDate.getDate() - 1}'`

        return await this
            .query(`select j.jobpost_id, j.keyword_code, keyword from jobpostkeyword j 
                    left join keyword k on j.keyword_code = k.keyword_code 
                    left join jobpost jp on j.jobpost_id = jp.jobpost_id
                    ${where}
                    group by keyword_code
                    order by keyword asc`)
    }
}