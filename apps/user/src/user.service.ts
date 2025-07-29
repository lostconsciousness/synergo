import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateFullNameDto } from './dto/update-fullname.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RpcException } from '@nestjs/microservices';
import { UpdateProfilePictureDto } from './dto/update-profilePicture.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { UpdateColorSchemeDto } from './dto/update-colorScheme.dto';
import { GetMeDto } from './dto/getMe.dto';
import { GetCurrentOrganizationIdDto } from './dto/get-currentOrganizationId.dto';
import { SelectCurrentOrganizationDto } from './dto/select-currentOrganization.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async getMe(dto: GetMeDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getCurrentOrganizationId(dto: GetCurrentOrganizationIdDto): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    return user.currentOrganizationId;
  }

  async getUserIdByEmail(email: string): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user?.id ?? null;
  }

  async getUserEmailById(id: string): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user?.email ?? null;
  }

  async createUser(dto: CreateUserDto) {
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new RpcException('User already exists');

    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      language: dto.language || 'en',
      colorScheme: dto.colorScheme || 'light',
    });
    const saved = await this.userRepository.save(user);

    console.log('User created successfully:', saved);
    return { id: saved.id, email: saved.email };
  }

  async selectCurrentOrganization(dto: SelectCurrentOrganizationDto) {
    try{
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('User not found');
      user.currentOrganizationId = dto.organizationId;
      await this.userRepository.save(user);
      console.log('Current organization selected successfully:', user.currentOrganizationId);
      const tokens = await this.authClient.send('auth_selectCurrentOrganization', {
        organizationId: dto.organizationId,
        userId: dto.userId,
      }).toPromise();

      return tokens;
    } catch (error) {
      console.error('Select Current Organization error: ', error);
      throw new RpcException(error.message || 'Select Current Organization failed');
    }
  }

  async updateFullName(dto: UpdateFullNameDto):Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    user.fullName = dto.fullName;
    const result = this.userRepository.save(user)
    return { message: 'Fullname updated successfully' };
  }
  
  async updateProfilePicture(dto: UpdateProfilePictureDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    user.profilePicture = dto.profilePicture;
    await this.userRepository.save(user);
    
    return { message: 'Profile picture updated successfully' };
  }

  async updateUserLanguage(dto: UpdateLanguageDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    user.language = dto.language;
    await this.userRepository.save(user);

    return { message: 'Language updated successfully' };
  }

  async updateUserColorScheme(dto: UpdateColorSchemeDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    user.colorScheme = dto.colorScheme;
    await this.userRepository.save(user);

    return { message: 'Color scheme updated successfully' };
  }
}