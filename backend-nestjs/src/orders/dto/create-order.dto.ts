
import { IsNotEmpty, IsString, IsInt, IsPositive, IsEnum, IsNumber, Min } from 'class-validator';
import { OrderType } from '@prisma/client';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    portfolioId: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsInt()
    @IsPositive()
    quantity: number;

    @IsEnum(OrderType)
    type: OrderType;

    @IsNumber()
    @Min(0)
    price: number;
}
