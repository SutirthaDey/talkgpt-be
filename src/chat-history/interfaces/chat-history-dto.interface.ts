import { SenderRoleEnum } from '../enums/sender-role.enum';

export default interface ChatHistoryDtoInterface {
  role: SenderRoleEnum;
  content: string;
}
