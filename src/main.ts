import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  await app.listen(process.env.PORT)

  app.useStaticAssets(join(__dirname, '..', 'src', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'))
    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}
bootstrap();
