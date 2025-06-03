import { Injectable } from '@nestjs/common';
import { ChatHistoryService } from '../chat-history.service';
import { StreamingService } from 'src/streaming/streaming.service';
import { SendMessageDto } from '../dtos/send-message.dto';
import { SenderRoleEnum } from '../enums/sender-role.enum';

@Injectable()
export class ChatProvider {
  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly streamingService: StreamingService,
  ) {}

  async handleUserMessage(sessionId: string, sendMessageDto: SendMessageDto) {
    // 1. Save user message
    await this.chatHistoryService.addMessage(sessionId, sendMessageDto);

    // 2. Simulate assistant thinking and sending tokens (stream)
    const fakeResponse =
      'This is the assistant response streamed word by word.';
    const words = fakeResponse.split(' ');

    for (const word of words) {
      await new Promise((res) => setTimeout(res, 200)); // simulate delay
      this.streamingService.emitToSession(sessionId, word);
    }

    sendMessageDto.role = SenderRoleEnum.System;
    // 3. Save assistant full response as a message
    await this.chatHistoryService.addMessage(sessionId, sendMessageDto);
  }
}
