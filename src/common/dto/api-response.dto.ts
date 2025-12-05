import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ description: '에러 코드' })
  code: string;

  @ApiProperty({ description: '에러 메시지' })
  message: string;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;

  @ApiProperty({ description: '에러 정보', required: false, type: ApiErrorDto })
  error?: ApiErrorDto;

  static success<T>(data: T): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.data = data;
    return response;
  }

  static error(code: string, message: string): ApiResponseDto<null> {
    const response = new ApiResponseDto<null>();
    response.success = false;
    response.error = { code, message };
    return response;
  }
}
