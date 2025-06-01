/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
// Import external modules
import { winstonLoggerOptions } from '@config/logger.config';
import { createDocument } from '@core/docs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';
import axios from 'axios';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';

const logger = new Logger('bootstrap');

function keepAliveServer() {
  const url = 'https://spendwise-r1l1.onrender.com/api/v1/health-check';
  axios
    .get(url)
    .then(() => {})
    .catch((e) => {
      console.error(e);
    });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  app.enableCors({ origin: '*' });
  app.use(morgan('dev'));
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const tz = configService.get<string>('app.tz');
  const versionEnable = configService.get<boolean>('app.enableVersion') || true;
  const versionPrefix = configService.get<string>('app.versionPrefix') || '';
  const globalPrefix: string = configService.get<string>('app.globalPrefix') || '';
  const defaultVersion: string = configService.get<string>('app.defaultVersion') || '';
  const PORT = configService.get<number>('app.port') || 3000;
  app.setGlobalPrefix(globalPrefix);
  process.env.TZ = tz;
  if (versionEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion,
      prefix: versionPrefix,
    });
  }
  createDocument(app);
  await app.listen(PORT);
  if (process.env.NODE_ENV !== 'development') {
    setInterval(keepAliveServer, 300000);
  }
  logger.log(`Application listening on port ${PORT}`);
}

bootstrap();
