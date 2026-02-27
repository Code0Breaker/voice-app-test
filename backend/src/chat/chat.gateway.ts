import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { OllamaService } from '../ollama/ollama.service';

interface SendMessagePayload {
  conversationId?: string;
  text: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly ollamaService: OllamaService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: SendMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const conversation = await this.chatService.getOrCreateConversation(
        payload.conversationId,
      );

      await this.chatService.addMessage(
        conversation.id,
        'user',
        payload.text,
      );

      const history = await this.chatService.getConversationMessages(
        conversation.id,
      );
      const ollamaMessages = history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const assistantMsg = await this.chatService.addMessage(
        conversation.id,
        'assistant',
        '',
      );

      let fullResponse = '';

      for await (const chunk of this.ollamaService.streamChat(ollamaMessages)) {
        fullResponse += chunk;
        client.emit('chunk', {
          conversationId: conversation.id,
          messageId: assistantMsg.id,
          text: chunk,
          done: false,
        });
      }

      await this.chatService.updateMessage(assistantMsg.id, fullResponse);

      client.emit('chunk', {
        conversationId: conversation.id,
        messageId: assistantMsg.id,
        text: '',
        done: true,
      });
    } catch (error) {
      console.error('Chat error:', error);
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
