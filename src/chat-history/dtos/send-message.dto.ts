import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import ChatHistoryDtoInterface from '../interfaces/chat-history-dto.interface';
import { ChatHistoryBodyDto } from './chat-history-body.dto';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryBodyDto) // This does NOT strictly enforce the interface at runtime
  chatHistory: ChatHistoryDtoInterface[] = [];
}
