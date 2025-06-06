import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Groq from 'groq-sdk';
import { StreamingService } from '../streaming.service';
import streamingConfig from '../config/streaming.config';
import { ConfigType } from '@nestjs/config';
import ChatHistoryDtoInterface from 'src/chat-history/interfaces/chat-history-dto.interface';

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
          content: 'You are a helpful assistant.',
        },
        // Set a user message for the assistant to respond to.
        ...chatHistory,
      ],

      // The language model which will generate the completion.
      model: 'llama-3.3-70b-versatile',

      //
      // Optional parameters
      //

      // Controls randomness: lowering results in less random completions.
      // As the temperature approaches zero, the model will become deterministic
      // and repetitive.
      temperature: 0.5,

      // The maximum number of tokens to generate. Requests can use up to
      // 2048 tokens shared between prompt and completion.
      max_completion_tokens: 512,

      // Controls diversity via nucleus sampling: 0.5 means half of all
      // likelihood-weighted options are considered.
      top_p: 1,

      // A stop sequence is a predefined or user-specified text string that
      // signals an AI to stop generating content, ensuring its responses
      // remain focused and concise. Examples include punctuation marks and
      // markers like "[end]".
      stop: null,

      // If set, partial message deltas will be sent.
      stream: true,
    });
  }
}
