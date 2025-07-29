import { Body, Controller, Post, Patch } from '@nestjs/common';
import { rmqAuthClient } from '../clients/auth.client';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { LogoutDto } from '../dto/logout.dto';
import { Response } from 'express';
import { Res, UseGuards  } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor() {}

  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({
    status: 200,
    description: 'Successful registration. Returns accessToken and installs refreshToken in cookie',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Registration error (e.g., user already exists)',
    schema: {
      example: {
        error: 'User already exists',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during registration',
    schema: {
      example: {
        error: 'Registration failed',
      },
    },
  })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    await rmqAuthClient.connect();
    try {
      const result = await rmqAuthClient.send('auth_register', dto).toPromise();
      
      res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: false, 
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return res.send({ accessToken: result.accessToken });
    } catch (error) {
      console.error('Registration error: ', error);
      return { error: error.message || 'Registration failed' };
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Successful login. Returns accessToken and installs refreshToken in cookie',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR...',
      },
    },
  })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    await rmqAuthClient.connect();
    try {
      const result = await rmqAuthClient.send('auth_login', dto).toPromise();
       
      res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: false, 
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return res.send({ accessToken: result.accessToken });
    } catch (error) {
      console.error('Loggin error:', error);
      return { error: error.message || 'Login failed' };
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Successful refresh. Returns accessToken and installs refreshToken in cookie',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR...',
      },
    },
  })
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    await rmqAuthClient.connect();
    try {
      const result = await rmqAuthClient.send('auth_refresh', dto).toPromise();
       
      res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: false, 
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return res.send({ accessToken: result.accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      return { error: error.message || 'Token refresh failed' };
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Successful logout. Refresh token revoked',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() dto: LogoutDto) {
    await rmqAuthClient.connect();
    try {
      const result = await rmqAuthClient.send('auth_logout', dto).toPromise();
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error.message || 'Logout failed' };
    }
  }

  @ApiOperation({ summary: 'Update User Password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@CurrentUser() user: { id: string; email: string }, @Body() dto: UpdatePasswordDto,) {
    await rmqAuthClient.connect();
    try {
        const result = await rmqAuthClient.send('auth_updatePassword', {
          userId: user.id,
          newPassword: dto.newPassword
        }).toPromise();
        return result;
    } catch (error) {
        console.error('Update Password error:', error);
        return { error: error.message || 'Update Password failed' };
    }
  }

}
