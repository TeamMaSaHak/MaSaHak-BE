import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TimezoneSettingsResponseDto {
  @ApiProperty({
    description: '사용자 타임존',
    example: 'Asia/Seoul',
  })
  timezone: string;

  @ApiProperty({
    description: '마지막 수정일',
    example: '2025-01-06T00:00:00.000Z',
    nullable: true,
  })
  updatedAt: string | null;
}

export class UpdateTimezoneRequestDto {
  @ApiProperty({
    description: '타임존 (IANA 타임존)',
    example: 'America/New_York',
  })
  @IsString({ message: 'timezone은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'timezone은 필수입니다.' })
  timezone: string;
}

export class UpdateTimezoneResponseDto {
  @ApiProperty({
    description: '변경된 타임존',
    example: 'America/New_York',
  })
  timezone: string;

  @ApiProperty({
    description: '수정일',
    example: '2025-01-06T00:00:00.000Z',
  })
  updatedAt: string;
}
