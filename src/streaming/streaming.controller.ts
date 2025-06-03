import { Controller, Param, Sse } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { Observable } from 'rxjs';
import { AuthType } from 'src/auth/enums/auth-types.enum';
import { Auth } from 'src/auth/decorators/auth-type.decorator';

@Auth(AuthType.None)
@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Sse('stream/:sessionId')
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    return this.streamingService.getMessageStream(sessionId);
  }
}
