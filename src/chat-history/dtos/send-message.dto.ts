import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import ChatHistoryDtoInterface from '../interfaces/chat-history-dto.interface';
import { ChatHistoryBodyDto } from './chat-history-body.dto';
import xss from 'xss';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => xss(value))
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryBodyDto) // This does NOT strictly enforce the interface at runtime
  chatHistory: ChatHistoryDtoInterface[] = [];
}
