import { registerAs } from '@nestjs/config';

export default registerAs('streaming', () => ({
  groqKey: process.env.GROQ_KEY,
}));
