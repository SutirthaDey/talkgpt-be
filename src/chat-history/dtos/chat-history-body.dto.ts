import { IsString } from 'class-validator';

export class ChatHistoryBodyDto {
  @IsString()
  role: string;

  @IsString()
  content: string;
}
