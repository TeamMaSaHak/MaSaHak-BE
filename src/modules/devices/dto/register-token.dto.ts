import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum Platform {
  ANDROID = 'android',
  IOS = 'ios',
}

export class RegisterTokenRequestDto {
  @ApiProperty({
    description: 'FCM 디바이스 토큰',
    example: 'dGVzdC10b2tlbi1mb3ItZmNt...',
  })
  @IsString()
  @IsNotEmpty({ message: 'FCM 토큰은 필수입니다.' })
  fcmToken: string;

  @ApiProperty({
    description: '디바이스 플랫폼',
    enum: Platform,
    example: Platform.ANDROID,
  })
  @IsEnum(Platform, { message: '플랫폼은 android 또는 ios만 가능합니다.' })
  platform: Platform;
}

export class RegisterTokenResponseDto {
  @ApiProperty({
    description: '등록된 디바이스 ID',
    example: 1,
  })
  deviceId: number;

  @ApiProperty({
    description: '신규 등록 여부 (false면 기존 토큰 갱신)',
    example: true,
  })
  isNew: boolean;
}
