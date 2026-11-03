// lib/types/gateway.ts
// Precision TypeScript Types for Payment Gateway SaaS Suite (Supabase Cloud PostgreSQL)

export type MerchantTier = 'starter' | 'pro' | 'enterprise';
export type MerchantStatus = 'active' | 'suspended' | 'trial';
export type ChannelType = 
  | 'qris_gobiz' 
  | 'bca' 
  | 'brimo' 
  | 'dana_bisnis' 
  | 'shopeepay' 
  | 'bank_jago' 
  | 'seabank' 
  | 'mandiri_livin' 
  | 'custom';

export type PaymentMethodType = 'QRIS' | 'BANK_TRANSFER' | 'E_WALLET';
export type TransactionStatus = 'PENDING' | 'SETTLED' | 'EXPIRED' | 'FAILED';
export type WebhookDeliveryStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface GatewayMerchant {
  id: string; // UUID
  business_name: string;
  owner_name: string;
  email: string;
  phone_number?: string | null;
  tier: MerchantTier;
  status: MerchantStatus;
  webhook_url?: string | null;
  webhook_secret: string;
  created_at: string;
  updated_at: string;
}

export interface GatewayApiKey {
  id: string;
  merchant_id: string;
  key_name: string;
  public_key: string;
  secret_key_hash: string;
  is_active: boolean;
  last_used_at?: string | null;
  created_at: string;
}

export interface GatewayDevice {
  id: string;
  merchant_id: string;
  device_name: string;
  device_model?: string | null;
  fcm_token?: string | null;
  pairing_token: string;
  is_active: boolean;
  battery_level?: number | null;
  last_heartbeat_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GatewayBankAccount {
  id: string;
  merchant_id: string;
  device_id?: string | null;
  channel_type: ChannelType;
  account_number: string;
  account_holder: string;
  qris_nmid?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GatewayTransaction {
  id: string;
  merchant_id: string;
  bank_account_id?: string | null;
  device_id?: string | null;
  external_order_id?: string | null;
  amount: number;
  unique_code: number;
  expected_amount: number;
  payment_method: PaymentMethodType;
  channel: string;
  qris_payload?: string | null;
  status: TransactionStatus;
  raw_notification_text?: string | null;
  idempotency_key?: string | null;
  settled_at?: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface GatewayWebhookLog {
  id: string;
  merchant_id: string;
  transaction_id: string;
  target_url: string;
  payload: Record<string, any>;
  response_status?: number | null;
  response_body?: string | null;
  attempts: number;
  status: WebhookDeliveryStatus;
  next_retry_at?: string | null;
  created_at: string;
  delivered_at?: string | null;
}
