import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @IsNotEmpty({ message: 'eaPlayerId não pode ser vazio' })
  @IsNumber({}, { message: 'eaPlayerId deve ser um número' })
  @IsPositive({ message: 'eaPlayerId deve ser um número positivo' })
  @ApiProperty({ 
    description: 'ID único do jogador na EA FC',
    example: 252123456,
    type: 'number'
  })
  eaPlayerId: number;

  @IsOptional()
  @IsString({ message: 'jogadorNome deve ser uma string' })
  @ApiProperty({ 
    description: 'Nome do jogador (opcional)',
    example: 'Cristiano Ronaldo',
    type: 'string',
    required: false
  })
  jogadorNome?: string;
}
