import { IsUUID } from "class-validator";

export class getOrgsForUserDto {
  @IsUUID()
  userId: string;
}