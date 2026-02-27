import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { OllamaModule } from './ollama/ollama.module';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), 'data', 'chat.db'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    ChatModule,
    OllamaModule,
  ],
})
export class AppModule {}
