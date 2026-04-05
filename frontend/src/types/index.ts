export interface UserInfo {
  userId: number;
  userName: string;
  userAccount: string;
  userStatus: number;
}

export interface CustomerInfo {
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
}

export interface ProductInfo {
  productId: number;
  productName: string;
  productVolume: string;
  productSize: string;
  productTag?: string;
}

export interface SaleInvoice {
  invoiceId: string;
  customerId: number;
  customerName: string;
  customerAddress: string;
  shippingFee: number;
  isFreeShipping: boolean;
  totalMoney: number;
  invoiceTime: string;
  comment?: string;
  operater: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}