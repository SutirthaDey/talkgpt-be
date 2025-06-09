import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import ChatHistoryDtoInterface from '../interfaces/chat-history-dto.interface';
import { ChatHistoryBodyDto } from './chat-history-body.dto';
import { strictSanitize } from 'src/auth/utils/sanitize-input.util';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => strictSanitize(value))
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryBodyDto) // This does NOT strictly enforce the interface at runtime
  chatHistory: ChatHistoryDtoInterface[] = [];
}
