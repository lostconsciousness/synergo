import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBoardDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsBoolean()
    pinned?: boolean;

    @IsUUID()
    boardId: string; 

    @IsUUID()
    organizationId: string; 

    @IsUUID()
    updatedById: string;
}