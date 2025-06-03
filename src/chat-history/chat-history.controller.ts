import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interface/active-user.interface';
import { SendMessageDto } from './dtos/send-message.dto';

@Controller('chat')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Post('start')
  createSession(@ActiveUser('sub') user: ActiveUserData) {
    return this.chatHistoryService.createSession(user);
  }

  @Post('message/:sessionId')
  sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatHistoryService.addMessage(sessionId, sendMessageDto);
  }

  @Get(':sessionId')
  getSessionMessages(@Param('sessionId') sessionId: string) {
    return this.chatHistoryService.getHistory(sessionId);
  }

  @Get('sessions/:userId')
  getAllSessions(@ActiveUser('sub') user: ActiveUserData) {
    return this.chatHistoryService.getUserSessions(user);
  }
}
