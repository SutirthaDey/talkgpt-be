import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interface/active-user.interface';
import { SendMessageDto } from './dtos/send-message.dto';
import { ChatProvider } from './providers/chat.provider';

@Controller('chat')
export class ChatHistoryController {
  constructor(
    private readonly chatHistoryService: ChatHistoryService,
    private readonly chatProvider: ChatProvider,
  ) {}

  /** Takes user message
   * - inserts the message in db
   * - prepare ai response based on user message
   * - triggers sse response to user
   * - saves the response of system in db
   */
  @Post(':sessionId?')
  sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @ActiveUser() user: ActiveUserData,
    @Param('sessionId') sessionId?: string,
  ) {
    return this.chatProvider.handleUserMessage(sendMessageDto, user, sessionId);
  }

  /* Fetches messages of a particular session **/
  @Get('/:sessionId')
  async getSessionMessages(
    @Param('sessionId') sessionId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return await this.chatHistoryService.getHistory(sessionId, user);
  }

  /* Fetches session by a particular userId **/
  @Get('sessions/:userId')
  getAllSessions(@ActiveUser('sub') user: ActiveUserData) {
    return this.chatHistoryService.getUserSessions(user);
  }
}
