import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatHistory } from './entities/chat-history.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveUserData } from 'src/auth/interface/active-user.interface';
import { SendMessageDto } from './dtos/send-message.dto';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistory)
    private historyRepo: Repository<ChatHistory>,

    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
  ) {}

  async createSession(user: ActiveUserData): Promise<ChatHistory> {
    const session = this.historyRepo.create({ user: { id: user.sub } });
    return await this.historyRepo.save(session);
  }

  async addMessage(
    sessionId: string,
    sendMessageDto: SendMessageDto,
    role: string,
  ): Promise<ChatMessage> {
    const chatHistory = await this.historyRepo.findOne({
      where: { id: sessionId },
    });

    let newMessage = this.messageRepo.create({
      ...sendMessageDto,
      chatHistory,
      role,
    });

    newMessage = await this.messageRepo.save(newMessage);

    return newMessage;
  }

  async getHistory(
    sessionId: string,
    user: ActiveUserData,
  ): Promise<ChatMessage[]> {
    try {
      return this.messageRepo.find({
        where: { chatHistory: { id: sessionId, user: { id: user.sub } } },
        order: { createdAt: 'ASC' },
      });
    } catch {
      throw new InternalServerErrorException('Error fetching session messages');
    }
  }

  async getUserSessions(user: ActiveUserData): Promise<ChatHistory[]> {
    try {
      return this.historyRepo.find({
        where: { user: { id: user.sub } },
        order: { createdAt: 'DESC' },
      });
    } catch {
      throw new InternalServerErrorException('Error fetching user sessions');
    }
  }

  async findSessionByUser(
    user: ActiveUserData,
    sessionId: string,
  ): Promise<ChatHistory> {
    return this.historyRepo.findOneBy({
      user: { id: user.sub },
      id: sessionId,
    });
  }
}
