import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgInvite } from '../entities/org-invite.entity';
import { InviteUserDto } from '../dto/invite-user.dto';
import { randomUUID } from 'crypto'; 
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(OrgInvite)
    private readonly inviteRepo: Repository<OrgInvite>,
    @Inject('WEBSOCKET_SERVICE')
    private readonly wsClient: ClientProxy,
    @Inject('USER_SERVICE') 
    private readonly userClient: ClientProxy,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

    async acceptInvite(token: string, email: string | null | undefined): Promise<OrgInvite> {
        const invite =  await this.inviteRepo.findOne({ where: { token } });
        if (!invite) {
            throw new NotFoundException('Invite not found');
        }
        if (invite.email !== email) {
            throw new ForbiddenException('Invite email does not match provided email');
        }
        if (invite.status !== 'pending') {
            throw new Error('Invite is not pending');
        }
        if( invite.expiresAt < new Date()) {
            throw new Error('Invite has expired');
        }
        invite.status = 'accepted';
        invite.acceptedAt = new Date();
        await this.inviteRepo.save(invite);
        return invite;
    }

    async inviteUserToOrg(dto: InviteUserDto): Promise<OrgInvite> {
        const token = randomUUID(); 

        const orgName = await this.resolveOrganizationName(dto.organizationId);
        const userId = await this.resolveUserIdByEmail(dto.email);
        if (!userId) {
            throw new NotFoundException('User not found');
        }


        const invite = this.inviteRepo.create({
        organizationId: dto.organizationId,
        email: dto.email,
        invitedByUserId: dto.invitedByUserId,
        token,
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await this.inviteRepo.save(invite);

        this.wsClient.emit('user.notify', {
        userId: userId,
        title: 'Organization Invitation',
        message: `You were invited to organization ${orgName}`,
        token: token,
        });

        return invite;
    }

    private async resolveUserIdByEmail(email: string): Promise<string | null | undefined> {
        return await this.userClient.send<string>('user_getUserIdByEmail', email).toPromise();
    }

    private async resolveOrganizationName(organizationId: string): Promise<string> {
        const organization = await this.organizationRepo.findOne({ where: { id: organizationId } });
        if (!organization) {
            throw new NotFoundException('Organization not found (in invite service)');
        }
        return organization.name
    }
}
