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

  /* creates a sessionId in database and starts a conversation **/
  @Post('start')
  createSession(@ActiveUser('sub') user: ActiveUserData) {
    return this.chatHistoryService.createSession(user);
  }

  /** Takes user message
   * - inserts the message in db
   * - prepare ai response based on user message
   * - triggers sse response to user
   * - saves the response of system in db
   */
  @Post('message/:sessionId')
  sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatProvider.handleUserMessage(sessionId, sendMessageDto);
  }

  /* Fetches messages of a particular session **/
  @Get(':sessionId')
  getSessionMessages(@Param('sessionId') sessionId: string) {
    return this.chatHistoryService.getHistory(sessionId);
  }

  /* Fetches session by a particular userId **/
  @Get('sessions/:userId')
  getAllSessions(@ActiveUser('sub') user: ActiveUserData) {
    return this.chatHistoryService.getUserSessions(user);
  }
}
