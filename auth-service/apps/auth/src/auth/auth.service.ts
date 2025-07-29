import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) throw new RpcException('User already exists');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            email: dto.email,
            password: hashed,
            fullName: dto.fullName,
        });
        await this.userRepo.save(user);

        return this.generateTokens(user);
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    async refresh(refreshToken: string) {
        const payload = this.jwtService.verify(refreshToken); // может выбросить ошибку
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (!user || !user.hashedRefreshToken) throw new ForbiddenException();

        const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!isMatch) throw new ForbiddenException('Invalid refresh token');

        const newTokens = this.generateTokens(user);
        await this.saveRefreshToken(user.id, newTokens.refreshToken);

        return newTokens;
    }


    private generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return { accessToken, refreshToken };
    }
}
