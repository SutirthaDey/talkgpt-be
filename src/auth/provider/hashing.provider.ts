import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
  abstract hashPassword(password: string): Promise<string>;
  abstract compare(data: string | Buffer, hash: string): Promise<boolean>;
}
