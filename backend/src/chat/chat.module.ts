import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { OllamaModule } from '../ollama/ollama.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message]), OllamaModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
