import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatHistory } from './chat-history.entity';
import { SenderRoleEnum } from '../enums/sender-role.enum';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SenderRoleEnum,
    nullable: false,
  })
  role: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  message: string;

  @ManyToOne(() => ChatHistory, (chatHistory) => chatHistory.messages, {
    onDelete: 'CASCADE',
  })
  chatHistory: ChatHistory;

  @CreateDateColumn()
  createdAt: Date;
}
