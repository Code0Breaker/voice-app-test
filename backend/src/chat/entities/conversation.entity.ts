import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'New Chat' })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Message, (msg) => msg.conversation, { cascade: true })
  messages: Message[];
}
