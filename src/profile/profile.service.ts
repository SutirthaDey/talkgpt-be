import { Injectable } from '@nestjs/common';
import { ProfileInterface } from './interface/profile.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createProfile(profile: ProfileInterface) {
    const newProfile = this.profileRepository.create(profile);

    return await this.profileRepository.save(newProfile);
  }
}
