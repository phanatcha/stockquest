import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class OnboardingDto {
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsString()
  @IsNotEmpty()
  goal: string;

  @IsString()
  @IsNotEmpty()
  reactionDrop: string;

  @IsString()
  @IsNotEmpty()
  horizon: string;
}
