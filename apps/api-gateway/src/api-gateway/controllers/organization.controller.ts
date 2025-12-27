import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { rmqOrganizationClient } from '../clients/organization.client';
import { rmqUserClient } from '../clients/user.client';
import { InternalServerErrorException } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { OrgAccessGuard } from '../guards/jwt-org.guard';
import { InviteUserDto } from '../dto/invite-user.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateMemberRolesDto } from '../dto/update-member-roles.dto';
import { CreateRoleDto } from '../dto/create-role.dto';

@ApiTags('Organization')
@Controller('organization')
    export class OrganizationController {
    constructor() {}


    @Get('get-pemissions-list')
    @UseGuards(JwtAuthGuard)
    async getPermissionsList(){
        await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getPermissionsList', {}).toPromise();
            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'get-permissions-list failed');
            }
            return result
        } catch(error){
            console.error('get-permissions-list error: ', error);
            throw new InternalServerErrorException(error.message || 'get-permissions-list failed');
        }
    }

    @Get('get-organizations-for-user')
    @UseGuards(JwtAuthGuard)
    async getOrganizationsForUser(@CurrentUser() user: JwtPayload){
        await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getOrganizationsForUser', { userId: user.id }).toPromise();
            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'get-organizations-for-user failed');
            }
            return result
        } catch(error){
            console.error('get-organizations-for-user error: ', error);
            throw new InternalServerErrorException(error.message || 'get-organizations-for-user failed');
        }
    }


    @ApiOperation({ summary: 'Accept an organization invite' })
    @ApiResponse({ status: 200, description: 'Invite accepted successfully.' })
    @Post('accept-invite')
    @UseGuards(JwtAuthGuard)
    async acceptInvite(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: { userId: string; token: string },
        @CurrentUser() user: JwtPayload,
    ) {
        await rmqOrganizationClient.connect();
        try {
            const result = await rmqOrganizationClient.send('organization_acceptInvite', {
                userId: user.id,
                token: dto.token,
            }).toPromise();

            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'Accept Organization Invite failed');
            }

            res.cookie('orgRefreshToken', result.orgTokens.refreshToken, {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return { 
                message: 'Organization invite accepted successfully', 
                organizationMember: result.organizationMember, 
                orgAccessToken: result.orgTokens.accessToken
            };
        } catch (error) {
            console.error('Accept Organization Invite error: ', error);
            throw new InternalServerErrorException(error.message || 'Accept Organization Invite failed');
        }
    }

    
    @Post('create-organization')
    @ApiOperation({ summary: 'Create a new organization' })
    @ApiResponse({ status: 201, description: 'Organization created successfully.' })
    @UseGuards(JwtAuthGuard)
    async createOrganization(@Res({ passthrough: true }) res: Response, @CurrentUser() user: JwtPayload, @Body() createOrganizationDto: CreateOrganizationDto) {
        await rmqOrganizationClient.connect();
        try {
            const result = await rmqOrganizationClient.send('organization_create', {
                ...createOrganizationDto,
                userId: user.id
            }).toPromise();
            
            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'Create Organization failed');
            }
            
            res.cookie('orgRefreshToken', result.orgTokens.refreshToken, {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return {
                message: result.message,
                newOrganization: result.newOrganization,
                orgAccessToken: result.orgTokens.accessToken
            };
        } catch (error) {
            console.error('Create Organization error: ', error);
            throw new InternalServerErrorException(error.message || 'Create Organization failed');
        }
    }

    @Get(':organizationId/get-organization-members')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async getOrganizationMembers(@Param('organizationId') organizationId: string){
                await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getOrganizationMembers', { organizationId }).toPromise();
            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'get-organization-members failed');
            }
            return result
        } catch(error){
            console.error('get-organization-members error: ', error);
            throw new InternalServerErrorException(error.message || 'get-organization-members failed');
        }
    }

    @Get(':organizationId/get-organization-roles')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async getOrganizationRoles(@Param('organizationId') organizationId: string, @CurrentUser() user: JwtPayload){
        await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getOrganizationRoles', { organizationId, userId: user.id }).toPromise();
            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'get-organization-roles failed');
            }
            return result
        } catch(error){
            console.error('get-organization-roles error: ', error);
            throw new InternalServerErrorException(error.message || 'get-organization-roles failed');
        }
    }

    

    @Patch(':organizationId/update-role')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async updateOrganizationRole(@Body() dto: UpdateRoleDto, @CurrentUser() user: JwtPayload, @Param('organizationId') organizationId: string) {
        await rmqOrganizationClient.connect();
        try {
        const result = await rmqOrganizationClient.send(
            'organization_updateRole',
            { dto: {
                ...dto,
                updatedById: user.id,
                organizationId: organizationId
             }}
        ).toPromise();
        if (result && result.status === 'error') {
            throw new InternalServerErrorException(result.message || 'update-organization-role failed');
        }
        return result;
        } catch (error) {
        console.error('update-organization-role error: ', error);
        throw new InternalServerErrorException(
            error.message || 'update-organization-role failed',
        );
        }
    }

    @Patch(':organizationId/member/:memberId/update-roles')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async updateMemberRoles(@Body() dto: UpdateMemberRolesDto, @CurrentUser() user: JwtPayload, @Param('organizationId') organizationId: string, @Param('memberId') memberId: string) {
        await rmqOrganizationClient.connect();
        try {
        const result = await rmqOrganizationClient.send(
            'organization_updateMemberRoles',
            {
                ...dto,
                organizationId: organizationId,
                userId: memberId,
                updatedById: user.id
            },
        ).toPromise();
        if (result && result.status === 'error') {
            throw new InternalServerErrorException(result.message || 'update-member-roles failed');
        }
        return result;
        } catch (error) {
        console.error('update-member-roles error: ', error);
        throw new InternalServerErrorException(
            error.message || 'update-member-roles failed',
        );
        }
    }

    


    @Post(':organizationId/create-role')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async createRole(@Body() dto: CreateRoleDto, @Param('organizationId') organizationId: string, @CurrentUser() user: JwtPayload) {
        await rmqOrganizationClient.connect();
        try {
        const result = await rmqOrganizationClient.send('organization_createRole', {
            dto: {
                ...dto,
                orgId: organizationId,
                userId: user.id
            }
        }).toPromise();
        if (result && result.status === 'error') {
            throw new InternalServerErrorException(result.message || 'create-role failed');
        }
        return result;
        } catch (error) {
        console.error('create-role error: ', error);
        throw new InternalServerErrorException(
            error.message || 'create-role failed',
        );
        }
    }

    @ApiOperation({ summary: 'Invite a user to an organization' })
    @ApiResponse({ status: 201, description: 'User invited successfully.' })
    @Post(':organizationId/invite-member')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async sendInvite(
        @Param('organizationId') orgId: string,
        @Body() dto: InviteUserDto,
        @CurrentUser() user: JwtPayload,
    ){
        await rmqOrganizationClient.connect();
        try {
            const result = await rmqOrganizationClient.send('organization_inviteMember', {
                organizationId: orgId,
                email: dto.email,
                invitedByUserId: user.id,
            }).toPromise();
            
            if (result && result.status === 'error') {
                throw new InternalServerErrorException(result.message || 'Invite Organization Member failed');
            }
            
            return { message: 'User invited successfully', invite: result };
        } catch (error) {
            console.error('Invite Organization Member error: ', error);
            throw new InternalServerErrorException(error.message || 'Invite Organization Member failed');
        }
    }

    @Get(':organizationId')
    @ApiOperation({ summary: 'Get organization info and tokens' })
    @ApiResponse({ status: 200, description: 'Organization retrieved successfully with tokens.' })
    @UseGuards(JwtAuthGuard)
    async getOrganizationById(
        @Param('organizationId') organizationId: string,
        @CurrentUser() user: JwtPayload,
        @Res({ passthrough: true }) res: Response,
    ) {
        await rmqOrganizationClient.connect();
        try {
            // Получаем информацию об организации
            const orgResult = await rmqOrganizationClient.send('organization_getById', { id: organizationId }).toPromise();
            if (orgResult && orgResult.status === 'error') {
                throw new InternalServerErrorException(orgResult.message || 'Get Organization by ID failed');
            }

            // Получаем токены для организации
            await rmqUserClient.connect();
            const tokensResult = await rmqUserClient.send('user_selectCurrentOrganization', {
                userId: user.id,
                organizationId: organizationId,
            }).toPromise();

            if (!tokensResult || !tokensResult.accessToken || !tokensResult.refreshToken) {
                console.error('Invalid response from user service:', tokensResult);
                throw new InternalServerErrorException('Failed to get organization tokens');
            }

            // Устанавливаем cookie с refresh token
            res.cookie('orgRefreshToken', tokensResult.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // Возвращаем данные напрямую (passthrough: true позволяет это)
            return {
                ...orgResult,
                orgAccessToken: tokensResult.accessToken,
            };
        } catch (error) {
            console.error('Get Organization by ID error: ', error);
            throw new InternalServerErrorException(error.message || 'Get Organization by ID failed');
        }
    }

    
}