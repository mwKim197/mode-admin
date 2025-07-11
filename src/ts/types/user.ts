export interface ModelUser {
  userId: string;
  storeName?: string;
  tel?: string;
  earnMileage?: number;
  mileageNumber?: number;
  ipAddress?: string;
  remoteAddress?: string;
  isPhone?: boolean;
  limitCount?: number;
  washTime?: string;
  logoUrl?: string;
  url?: string;
  payType?: boolean;
  category?: Array<{
    name: string;
    no: string;
    item: string;
  }>;
  // ... 필요한 필드 추가
}
