import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
