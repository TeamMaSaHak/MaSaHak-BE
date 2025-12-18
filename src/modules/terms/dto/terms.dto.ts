import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum TermsType {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

export class GetTermsParamsDto {
  @ApiProperty({
    description: '약관 종류',
    enum: TermsType,
    example: 'terms',
  })
  @IsEnum(TermsType, { message: 'type은 terms 또는 privacy여야 합니다.' })
  type: TermsType;
}

export class GetTermsResponseDto {
  @ApiProperty({
    description: '약관 종류',
    enum: TermsType,
    example: 'terms',
  })
  type: TermsType;

  @ApiProperty({
    description: '약관 제목',
    example: '이용약관',
  })
  title: string;

  @ApiProperty({
    description: '약관 내용',
    example: '마법사관학교 앱 이용약관...',
  })
  content: string;

  @ApiProperty({
    description: '약관 버전',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: '시행일',
    example: '2025-01-01',
  })
  effectiveDate: string;
}
