import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; 
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {refreshDto} from './dto/refresh.dto'; 
import { LogoutDto } from './dto/logout.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SelectCurrentOrganizationDto } from './dto/select-currentOrganization.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth_register')
  async register(@Payload() data: RegisterDto) {
    return this.authService.register(data);
  }

  @MessagePattern('auth_login')
  async login(@Payload() data: LoginDto) { 
    return this.authService.login(data);
  }

  @MessagePattern('auth_refresh')
  async refresh(@Payload() data: refreshDto) {
    return this.authService.refresh(data);
  }

  @MessagePattern('auth_selectCurrentOrganization')
  async orgRefresh(@Payload() data: SelectCurrentOrganizationDto) {
    return this.authService.selectCurrentOrganization(data);
  }

  @MessagePattern('auth_logout')
  async logout(@Payload() data: LogoutDto) {
    return this.authService.logout(data);
  }

  @MessagePattern('auth_updatePassword')
  async updatePassword(@Payload() data: UpdatePasswordDto) {
    return this.authService.updatePassword(data);
  }
}
