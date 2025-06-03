import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SenderRoleEnum } from '../enums/sender-role.enum';

export class SendMessageDto {
  @IsNotEmpty()
  @IsEnum(SenderRoleEnum)
  role: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
