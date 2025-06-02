import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { GenerateTokenProvider } from './generate-token.provider';

@Injectable()
export class GoogleAuthenticationProvider implements OnModuleInit {
  public oauthClient: OAuth2Client;
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UsersService,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;

    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(googleTokenDto: GoogleTokenDto) {
    const { googleToken } = googleTokenDto;

    const loginTicket = await this.oauthClient.verifyIdToken({
      idToken: googleToken,
    });

    /* extract the payload from token **/
    const {
      email,
      sub: googleId,
      given_name: firstName,
      family_name: lastName,
      picture: profilePic,
    } = loginTicket.getPayload();

    const user = await this.userService.getUserByGoogleId(googleId);

    if (!user) {
      const newUser = await this.userService.createGoogleUser({
        email,
        googleId,
        firstName,
        lastName,
        profilePic,
      });

      return await this.generateTokenProvider.generateTokens(newUser);
    }

    return await this.generateTokenProvider.generateTokens(user);
  }
}
