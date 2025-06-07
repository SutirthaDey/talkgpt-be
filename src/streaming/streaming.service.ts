import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StreamingService {
  private sessions = new Map<string, Subject<{ data: string }>>();
  private userStreams: Map<number, Subject<any>> = new Map();

  // Create or get subject for session
  getOrCreateSubject(sessionId: string): Subject<{ data: string }> {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Subject<{ data: string }>());
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

  getSessionStreamForUser(userId: number) {
    if (!this.userStreams.has(userId)) {
      this.userStreams.set(userId, new Subject());
    }

    return this.userStreams.get(userId).asObservable();
  }

  sendSessionToUser(userId: number, sessionId: string) {
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.next({ data: sessionId });
    }
  }

  // Emit a message to a session
  emitToSession(sessionId: string, data: string) {
    const subject = this.sessions.get(sessionId);
    if (subject) {
      subject.next({ data }); // Plain object
    }
  }
}
