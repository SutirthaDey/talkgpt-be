import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Groq from 'groq-sdk';
import { StreamingService } from '../streaming.service';
import streamingConfig from '../config/streaming.config';
import { ConfigType } from '@nestjs/config';
import ChatHistoryDtoInterface from 'src/chat-history/interfaces/chat-history-dto.interface';
import { SenderRoleEnum } from 'src/chat-history/enums/sender-role.enum';

@Injectable()
export class GroqProvider implements OnModuleInit {
  private groq: Groq;

  constructor(
    private readonly streamingService: StreamingService,
    @Inject(streamingConfig.KEY)
    private readonly streamingConfiguration: ConfigType<typeof streamingConfig>,
  ) {}

  onModuleInit() {
    this.groq = new Groq({ apiKey: this.streamingConfiguration.groqKey });
  }

  public async streamGroqResponse(
    sessionId: string,
    chatHistory: ChatHistoryDtoInterface[],
  ) {
    const stream = await this.getGroqChatStream(chatHistory);
    let reply: string = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      this.streamingService.emitToSession(sessionId, content);

      reply = reply + content;

      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Emit a custom end-of-stream indicator
    this.streamingService.emitToSession(sessionId, '[STREAM_END]');

    return reply;
  }

  private async getGroqChatStream(chatHistory: ChatHistoryDtoInterface[]) {
    return this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are Nova, a smart, friendly AI assistant. Help users clearly and concisely like ChatGPT.',
        },
        ...chatHistory,
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_completion_tokens: 512,
      top_p: 1,
      stop: null,

      stream: true,
    });
  }

  public async getMessageSummary(message: string) {
    const chatHistory = [
      {
        role: SenderRoleEnum.User,
        content: `Summarize following text within 3-4 words strictly, just key words, I want to make a title out of it. The sentence is : ${message}`,
      },
    ];

    const stream = await this.getGroqChatStream(chatHistory);
    let reply: string = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      reply = reply + content;
    }

    return reply;
  }
}
