import { registerAs } from '@nestjs/config';

export default registerAs('', () => ({
  NODE_ENV: process.env.NODE_ENV,
}));
