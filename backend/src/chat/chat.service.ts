import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async getOrCreateConversation(id?: string): Promise<Conversation> {
    if (id) {
      const existing = await this.conversationRepo.findOne({ where: { id } });
      if (existing) return existing;
    }
    return this.conversationRepo.save(this.conversationRepo.create());
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<Message> {
    return this.messageRepo.save(
      this.messageRepo.create({ conversationId, role, content }),
    );
  }

  async updateMessage(id: string, content: string): Promise<void> {
    await this.messageRepo.update(id, { content });
  }
}
