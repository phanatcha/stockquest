import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateLeagueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  startingCapital: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(2)
  @IsOptional()
  maxParticipants?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(2)
  @IsOptional()
  minParticipants?: number;
}
