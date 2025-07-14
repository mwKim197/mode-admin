export interface ModelUser {
  userId: string;
  storeName?: string;
  tel?: string;
  businessNo?: string; // 추가
  earnMileage?: number;
  mileageNumber?: number;
  remoteAddress?: string;
  isPhone?: boolean;
  limitCount?: number;
  washTime?: string;
  logoBase64?: string; // S3 URL 대신 Base64
  iconBase64?: string; // S3 URL 대신 Base64
  url?: string;
  payType?: boolean;
  category?: Array<{
    name: string;
    no: string;
    item: string;
  }>;
  // ... 필요한 필드 추가
}
