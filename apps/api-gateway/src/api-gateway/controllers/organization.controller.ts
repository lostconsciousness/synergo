import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { rmqOrganizationClient } from '../clients/organization.client';
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

    @Get(':organizationId')
    @ApiOperation({ summary: 'Get organization info' })
    @ApiResponse({ status: 200, description: 'Organization retrieved successfully.' })
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async getOrganizationById(@Param('organizationId') organizationId: string) {
        await rmqOrganizationClient.connect();
        try {
            return await rmqOrganizationClient.send('organization_getById', { id: organizationId }).toPromise();
        } catch (error) {
            console.error('Get Organization by ID error: ', error);
            throw new InternalServerErrorException(error.message || 'Get Organization by ID failed');
        }
    }

    @Get('get-organizations-for-user')
    @UseGuards(JwtAuthGuard)
    async getOrganizationsForUser(@CurrentUser() user: JwtPayload){
        await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getOrganizationsForUser', user.id)
            return result
        } catch(error){
            console.error('get-organizations-for-user error: ', error);
            throw new InternalServerErrorException(error.message || 'get-organizations-for-user failed');
        }
    }

    @Get(':organizationId/get-organization-members')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async getOrganizationMembers(@Param('organizationId') organizationId: string){
                await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getOrganizationMembers', organizationId)
            return result
        } catch(error){
            console.error('get-organization-members error: ', error);
            throw new InternalServerErrorException(error.message || 'get-organization-members failed');
        }
    }

    @Get(':organizationId/get-organization-roles')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async getOrganizationRoles(@Param('organizationId') organizationId: string){
        await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getOrganizationRoles', organizationId)
            return result
        } catch(error){
            console.error('get-organization-roles error: ', error);
            throw new InternalServerErrorException(error.message || 'get-organization-roles failed');
        }
    }

    @Get('get-pemissions-list')
    @UseGuards(JwtAuthGuard)
    async getPermissionsList(){
        await rmqOrganizationClient.connect();
        try{
            const result = await rmqOrganizationClient.send('organization_getPermissionsList', null)
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
            { ...dto,
                updatedById: user.id,
                organizationId: organizationId
             },
        );
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
        );
        return result;
        } catch (error) {
        console.error('update-member-roles error: ', error);
        throw new InternalServerErrorException(
            error.message || 'update-member-roles failed',
        );
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
            res.cookie('orgRefreshToken', result.orgTokens.refreshToken, {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.send({
                message: result.message,
                newOrganization: result.newOrganization,
                orgAccessToken: result.orgTokens.accessToken
            });
        } catch (error) {
            console.error('Create Organization error: ', error);
            throw new InternalServerErrorException(error.message || 'Create Organization failed');
        }
    }


    @Post(':organizationId/create-role')
    @UseGuards(JwtAuthGuard, OrgAccessGuard)
    async createRole(@Body() dto: CreateRoleDto, @Param('organizationId') organizationId: string, @CurrentUser() user: JwtPayload) {
        await rmqOrganizationClient.connect();
        try {
        const result = await rmqOrganizationClient.send('organization_createRole', {
            ...dto,
            orgId: organizationId,
            userId: user.id
        });
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
            return { message: 'User invited successfully', invite: result };
        } catch (error) {
            console.error('Invite Organization Member error: ', error);
            throw new InternalServerErrorException(error.message || 'Invite Organization Member failed');
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

            res.cookie('orgRefreshToken', result.orgTokens.refreshToken, {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.send({ 
                message: 'Organization invite accepted successfully', 
                organizationMember: result.organizationMember, 
                orgAccessToken: result.orgTokens.accessToken
            });
        } catch (error) {
            console.error('Accept Organization Invite error: ', error);
            throw new InternalServerErrorException(error.message || 'Accept Organization Invite failed');
        }
    }
}