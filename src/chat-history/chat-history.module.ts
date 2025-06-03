import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistoryController } from './chat-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistory } from './entities/chat-history.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatProvider } from './providers/chat.provider';
import { StreamingModule } from 'src/streaming/streaming.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatHistory, ChatMessage]),
    StreamingModule,
  ],
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService, ChatProvider],
})
export class ChatHistoryModule {}
