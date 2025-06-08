import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().required(),
  DATABASE_PORT: Joi.number().positive().default(5432),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNC: Joi.string().required(),
  DATABASE_AUTOLOAD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ISSUER: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),
  JWT_ACCESS_TTL: Joi.number().required(),
  JWT_REFRESH_TTL: Joi.number().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_SECRET_ID: Joi.string().required(),
  GROQ_KEY: Joi.string().required(),
});
