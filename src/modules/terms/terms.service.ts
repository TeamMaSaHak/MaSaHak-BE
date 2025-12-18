import { Injectable, NotFoundException } from '@nestjs/common';
import { TermsType, GetTermsResponseDto } from './dto';
import { TERMS_DATA } from './constants';

@Injectable()
export class TermsService {
  /**
   * 약관/정책 조회
   * - 정적 콘텐츠 반환
   */
  getTerms(type: TermsType): GetTermsResponseDto {
    const termsData = TERMS_DATA[type];

    if (!termsData) {
      throw new NotFoundException('요청한 약관을 찾을 수 없습니다.');
    }

    return {
      type: termsData.type,
      title: termsData.title,
      content: termsData.content,
      version: termsData.version,
      effectiveDate: termsData.effectiveDate,
    };
  }
}
