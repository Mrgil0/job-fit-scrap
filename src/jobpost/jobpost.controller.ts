import {
	Controller,
	Get,
} from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { JobpostService } from './jobpost.service'

@Controller('api/jobpost')
export class JobpostController {
	constructor(private readonly jobpostService: JobpostService) {}

	@Cron('0 0 5 * * *') // 매일 새벽 5시
	@Get('/saramin')
	async getSaraminData() {
			return await this.jobpostService.getSaraminJobposts()
	}

	@Cron('0 0 4 * * *') // 매일 새벽 4시
	@Get('/wanted')
	async getWantedJobposts() {
			return await this.jobpostService.getWantedJobposts()
	}

	@Cron('0 0 3 * * *') // 매일 새벽 3시
	@Get('/programmers')
	async getProgrammersJobposts() {
			return await this.jobpostService.getProgrammersJobposts()
	}
}
