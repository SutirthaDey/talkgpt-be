import { Module } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { StreamingController } from './streaming.controller';
import { GroqProvider } from './provider/groq.provider';
import { ConfigModule } from '@nestjs/config';
import streamingConfig from './config/streaming.config';

@Module({
  imports: [ConfigModule.forFeature(streamingConfig)],
  controllers: [StreamingController],
  providers: [StreamingService, GroqProvider],
  exports: [StreamingService, GroqProvider],
})
export class StreamingModule {}
