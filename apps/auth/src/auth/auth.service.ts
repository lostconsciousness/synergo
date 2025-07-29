import { Inject, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { refreshDto } from './dto/refresh.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthUser } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { RefreshTokenService } from './refresh-token.service';
import { OrgRefreshTokenService } from './org-refresh-token.service';
import { ClientProxy } from '@nestjs/microservices';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { OrgJwtPayload } from './interfaces/org-jwt-payload.interface';
import { orgRefreshDto } from './dto/org-refresh.dto';
import { SelectCurrentOrganizationDto } from './dto/select-currentOrganization.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthUser)
        private readonly userRepo: Repository<AuthUser>,
        private readonly jwtService: JwtService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly orgRefreshTokenService: OrgRefreshTokenService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy, 
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) throw new RpcException('User already exists');

        const hashed = await bcrypt.hash(dto.password, 10);

        const user = await this.userClient.send('user_create', {
            fullName: dto.fullName || dto.email,
            email: dto.email,
            language: dto.userLanguage || 'en',
            colorScheme: dto.userColorScheme || 'light',
        }).toPromise();

        console.log('User created in user service:', user);
        const authUser = this.userRepo.create({
            userId: user.id,
            email: user.email,
            password: hashed,
        });
        await this.userRepo.save(authUser);

        const tokens =  this.generateTokens(user);
        await this.refreshTokenService.save(user.userId, tokens.refreshToken);
        return tokens;
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
        }

        const tokens =  this.generateTokens(user);
        await this.refreshTokenService.save(user.userId, tokens.refreshToken);
        return tokens;
    }

    async refresh(dto: refreshDto) {
        const { userId, refreshToken } = dto;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const isValid = await this.refreshTokenService.validate(userId, refreshToken);
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');

        const tokens =  this.generateTokens(user);
        await this.refreshTokenService.save(user.userId, tokens.refreshToken);
        return tokens;
    }

    async selectCurrentOrganization(dto: SelectCurrentOrganizationDto) {
        try{
            const { userId, orgId } = dto;
            const user = await this.userRepo.findOne({ where: { userId: userId } });
            if (!user) throw new UnauthorizedException('User not found');

            await this.orgRefreshTokenService.revoke(userId, orgId);
            const tokens = await this.generateOrgTokens(orgId, userId);
            await this.orgRefreshTokenService.save(userId, orgId, tokens.refreshToken);
            return tokens;
        } catch (error) {
            console.error('Select Current Organization error: ', error);
            throw new UnauthorizedException(error.message || 'Select Current Organization failed');
        }
    }

    async organizationRefresh(dto: orgRefreshDto) {
        const { orgId, userId, refreshToken } = dto;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        const org = await this.userClient.send('user_getCurrentOrganizationId', { userId }).toPromise();
        if (!org || org.id !== orgId) throw new UnauthorizedException('Organization is wrong or not found');
        const isValid = await this.orgRefreshTokenService.validate(userId, orgId, refreshToken);
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');

        const tokens = await this.generateOrgTokens(orgId, userId);
        const newRefreshToken = tokens.refreshToken;
        await this.orgRefreshTokenService.save(userId, orgId, newRefreshToken);
        return tokens;
    }

    async logout(dto: LogoutDto) {
        const { userId } = dto;

        await this.refreshTokenService.revoke(userId);
        return { message: 'Logged out successfully' };
    }  

    async updatePassword(dto: UpdatePasswordDto): Promise<{ message: string }> {
        const user = await this.userRepo.findOne({ where: { id: dto.userId } });
        if (!user) {
        throw new NotFoundException('User not found');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        await this.userRepo.save(user);

        return { message: 'Password updated successfully' };
    }

    private generateTokens(user: AuthUser) {
        const payload: JwtPayload = {
            id: user.userId,
            email: user.email,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return { accessToken, refreshToken };
    }

    async generateOrgTokens(orgId: string, userId: string) {
        const payload: OrgJwtPayload = { orgId: orgId, userId: userId };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return { accessToken, refreshToken };
    }

}
