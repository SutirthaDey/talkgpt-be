import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  jwtTtl: parseInt(process.env.JWT_ACCESS_TTL),
  refreshTtl: parseInt(process.env.JWT_REFRESH_TTL),
}));
