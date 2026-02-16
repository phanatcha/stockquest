
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateLeagueDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    startingCapital: number;

    @IsDateString()
    endDate: string;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}
