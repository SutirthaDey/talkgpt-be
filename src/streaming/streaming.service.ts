import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StreamingService {
  private sessions = new Map<string, Subject<MessageEvent>>();

  // Create or get subject for session
  getOrCreateSubject(sessionId: string): Subject<MessageEvent> {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Subject<MessageEvent>());
    }
    return this.sessions.get(sessionId);
  }

  // Get the stream for a session
  getMessageStream(sessionId: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      const subject = this.getOrCreateSubject(sessionId);
      const subscription = subject.asObservable().subscribe(observer);

      return () => {
        subscription.unsubscribe();
        subject.complete();
        this.sessions.delete(sessionId); // 🧹 prevent memory leaks
      };
    });
  }

  // Emit a message to a session
  emitToSession(sessionId: string, data: string) {
    const subject = this.sessions.get(sessionId);
    if (subject) {
      subject.next(new MessageEvent('message', { data }));
    }
  }
}
