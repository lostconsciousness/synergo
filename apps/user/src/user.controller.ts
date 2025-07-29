import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateFullNameDto } from './dto/update-fullname.dto';
import { UpdateProfilePictureDto } from './dto/update-profilePicture.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { UpdateColorSchemeDto } from './dto/update-colorScheme.dto';
import { GetMeDto } from './dto/getMe.dto';
import { GetCurrentOrganizationIdDto } from './dto/get-currentOrganizationId.dto';
import { SelectCurrentOrganizationDto } from './dto/select-currentOrganization.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user_getMe')
  async getMe(@Payload() data: GetMeDto) {
    return this.userService.getMe(data);
  }

  @MessagePattern('user_getCurrentOrganizationId')
  async getCurrentOrganizationId(@Payload() data: GetCurrentOrganizationIdDto) {    
    return this.userService.getCurrentOrganizationId(data);
  }

  @MessagePattern('user_getUserIdByEmail')
  async getUserIdByEmail(@Payload() email: string) {
    return this.userService.getUserIdByEmail(email);
  }

  @MessagePattern('user_getUserEmailById')
  async getUserEmailById(@Payload() id: string) {
    return this.userService.getUserEmailById(id);
  }

  @MessagePattern('user_create')
  async createUser(@Payload() data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @MessagePattern('user_selectCurrentOrganization')
  async selectCurrentOrganization(@Payload() data: SelectCurrentOrganizationDto) {
    return this.userService.selectCurrentOrganization(data);
  }

  @MessagePattern('user_updateFullName')
  async updateFullName(@Payload() data: UpdateFullNameDto) {
    return this.userService.updateFullName(data);
  }

  @MessagePattern('user_updateProfilePicture')
  async updateProfilePicture(@Payload() data: UpdateProfilePictureDto){
    return this.userService.updateProfilePicture(data);
  }

  @MessagePattern('user_updateLanguage')
  async updateUserLanguage(@Payload() data: UpdateLanguageDto) {
    return this.userService.updateUserLanguage(data);
  }

  @MessagePattern('user_updateColorScheme')
  async updateUserColorScheme(@Payload() data: UpdateColorSchemeDto) {
    return this.userService.updateUserColorScheme(data);
  }
}
