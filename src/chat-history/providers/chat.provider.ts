import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatHistoryService } from '../chat-history.service';
import { StreamingService } from 'src/streaming/streaming.service';
import { SendMessageDto } from '../dtos/send-message.dto';
import { SenderRoleEnum } from '../enums/sender-role.enum';
import { ActiveUserData } from 'src/auth/interface/active-user.interface';
import { GroqProvider } from 'src/streaming/provider/groq.provider';

@Injectable()
export class ChatProvider {
  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly streamingService: StreamingService,
    private readonly groqProvider: GroqProvider,
  ) {}

  async handleUserMessage(
    sendMessageDto: SendMessageDto,
    user: ActiveUserData,
    sessionId?: string,
  ) {
    // create a session if session Id is null
    if (!sessionId) {
      try {
        const newSession = await this.chatHistoryService.createSession(user);
        sessionId = newSession.id;
      } catch {
        throw new BadRequestException('Failed to create session.');
      }
    } else {
      const session = await this.chatHistoryService.findSessionByUser(
        user,
        sessionId,
      );

      if (!session) {
        throw new BadRequestException(
          `Yor are not authorized to access this session`,
        );
      }
    }

    let role = SenderRoleEnum.User;

    try {
      // 1. Save user message
      await this.chatHistoryService.addMessage(sessionId, sendMessageDto, role);
    } catch {
      throw new BadRequestException('Failed to save user message.');
    }

    // 2. Simulate assistant thinking and sending tokens (stream)
    // const fakeResponse = `Reponse: ${sendMessageDto.message}`;
    // const words = fakeResponse.split(' ');

    let reply;
    try {
      // for (const word of words) {
      //   await new Promise((res) => setTimeout(res, 20)); // simulate delay
      //   this.streamingService.emitToSession(sessionId, word + ' ');
      // }
      reply = await this.groqProvider.streamGroqResponse(
        sessionId,
        sendMessageDto.chatHistory,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to simulate assistant thinking.',
      );
    }

    role = SenderRoleEnum.System;
    sendMessageDto.message = reply;

    // 3. Save assistant full response as a message
    try {
      await this.chatHistoryService.addMessage(sessionId, sendMessageDto, role);
    } catch {
      throw new BadRequestException('Failed to save user message.');
    }

    return { sessionId: sessionId };
  }
}
