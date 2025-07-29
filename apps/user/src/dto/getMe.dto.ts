import { IsUUID, IsString } from 'class-validator';

export class GetMeDto {
    @IsString()
    @IsUUID()
    userId: string;
}