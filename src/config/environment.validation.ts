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
});
