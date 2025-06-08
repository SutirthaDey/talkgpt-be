import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthType } from './auth/enums/auth-types.enum';
import { Auth } from './auth/decorators/auth-type.decorator';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth(AuthType.None)
  @Get('health')
  getHealth(): string {
    return 'OK';
  }
}
