import { User } from 'src/users/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity()
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.chatHistories)
  user: User;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatHistory, {
    cascade: true,
  })
  messages: ChatMessage[];

  // @Column({
  //   type: 'boolean',
  //   default: false,
  //   nullable: false,
  // })
  // isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
