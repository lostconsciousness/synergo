import { Body, Controller, Get, Patch, UseInterceptors, Post } from '@nestjs/common';
import { rmqUserClient } from '../clients/user.client';
import { UpdateFullNameDto } from '../dto/update-fullname.dto';
import { UpdateProfilePictureDto } from '../dto/update-profilePicture.dto';
import { Express, Response } from 'express';
import { Res, UseGuards  } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UpdateColorSchemeDto } from '../dto/update-colorScheme.dto';
import { UpdateLanguageDto } from '../dto/update-language.dto';
import {UploadedFile} from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SelectCurrentOrganizationDto } from '../dto/select-currentOrganization.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor() {}

    @ApiOperation({ summary: 'Get User' })
    @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
    @Get('get-me')
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: JwtPayload) {
        await rmqUserClient.connect();
        try {
            const result = await rmqUserClient.send('user_getMe', { userId: user.id }).toPromise();
            return result;
        } catch (error) {
            console.error('Get User error: ', error);
            return { error: error.message || 'Get User failed' };
        }
    }

    @ApiOperation({ summary: 'Select current organization' })
    @ApiResponse({ status: 200, description: 'Organization selected successfully.' })
    @Post('select-current-organization')
    @UseGuards(JwtAuthGuard)
    async selectCurrentOrganization(
        @CurrentUser() user: JwtPayload,
        @Body() dto: SelectCurrentOrganizationDto,
        @Res() res: Response
    ) {
        await rmqUserClient.connect();

        try {
        const result = await rmqUserClient
            .send('user_selectCurrentOrganization', {
            userId: user.id,
            organizationId: dto.organizationId,
            })
            .toPromise();

        if (!result || !result.accessToken || !result.refreshToken) {
            console.error('Invalid response from user service:', result);
            return res.status(500).json({ error: 'Invalid response from user service' });
        }

        res.cookie('orgRefreshToken', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return res.status(200).json({
            message: 'Current organization selected successfully',
            orgAccessToken: result.accessToken,
        });
        } catch (error) {
        console.error('Select Current Organization error: ', error);
        return res
            .status(500)
            .json({ error: error.message || 'Select Current Organization failed' });
        }
    }

    @ApiOperation({ summary: 'Update User Full Name' })
    @ApiResponse({ status: 200, description: 'Full name updated successfully.' })
    @Patch('update-fullname')
    @UseGuards(JwtAuthGuard)
    async updateFullName(@Body() dto: UpdateFullNameDto) {
        await rmqUserClient.connect();
        try {
        const result = await rmqUserClient.send('user_updateFullName', dto).toPromise();
        return result;
        } catch (error) {
        console.error('Update Full Name error: ', error);
        return { error: error.message || 'Update Full Name failed' };
        }
    }

    @ApiOperation({ summary: 'Update User Profile Picture' })
    @ApiResponse({ status: 200, description: 'Profile picture updated successfully.' })
    @Patch('update-profile-picture')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
        destination: './uploads/pfp',
        filename: (_req, file, cb) => {
        const unique = uuidv4() + extname(file.originalname);
        cb(null, unique);
        },
    }),
    }))
    async updateProfilePicture(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    ) {
    await rmqUserClient.connect();

    if (!file) {
        throw new BadRequestException('File is missing');
    }

    try {
        const profilePicture = `http://localhost:3000/uploads/pfp/${file.filename}`

        const result = await rmqUserClient.send('user_updateProfilePicture', {
        userId: user.id,
        profilePicture: profilePicture,
        }).toPromise();

        return {
        message: 'Profile picture updated successfully',
        profilePicture: file.filename,
        url: profilePicture,
        result,
        };
    } catch (error) {
        console.error('Update Profile Picture error: ', error);
        throw new InternalServerErrorException(
        error.message || 'Update Profile Picture failed',
        );
    }
    }


    @ApiOperation({ summary: 'Update User Language' })
    @ApiResponse({ status: 200, description: 'Language updated successfully.' })
    @Patch('update-language')
    @UseGuards(JwtAuthGuard)
    async updateUserLanguage(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLanguageDto) {
        await rmqUserClient.connect();
        try {
            const result = await rmqUserClient.send('user_updateLanguage', {
                userId: user.id,
                language: dto.newLanguage,
            }).toPromise();
            return result;
        } catch (error) {
            console.error('Update Language error: ', error);
            return { error: error.message || 'Update Language failed' };
        }
    }

    @ApiOperation({ summary: 'Update User Color Scheme' })
    @ApiResponse({ status: 200, description: 'Color scheme updated successfully.' })
    @Patch('update-color-scheme')
    @UseGuards(JwtAuthGuard)
    async updateUserColorScheme(@CurrentUser() user: JwtPayload, @Body() dto: UpdateColorSchemeDto) {
        await rmqUserClient.connect();
        try {
            const result = await rmqUserClient.send('user_updateColorScheme', {
                userId: user.id,
                colorScheme: dto.newColorScheme,
            }).toPromise();
            return result;
        } catch (error) {
            console.error('Update Color Scheme error: ', error);
            return { error: error.message || 'Update Color Scheme failed' };
        }
    }

}
