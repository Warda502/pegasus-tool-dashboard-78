
export interface User {
  id?: string;
  uid?: string;
  email?: string;
  name?: string;
  phone?: string;
  country?: string;
  password?: string;
  hwid?: string;
  credits?: string | number;
  user_type?: string;
  activate?: string;
  block?: string;
  email_type?: string;
  expiry_time?: string;
  start_date?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy properties (uppercase)
  Name?: string;
  Email?: string;
  Password?: string;
  Phone?: string;
  Country?: string;
  Activate?: string;
  Block?: string;
  Credits?: string;
  User_Type?: string;
  Email_Type?: string;
  Expiry_Time?: string;
  Start_Date?: string;
  Hwid?: string;
  UID?: string;
}

export interface Operation {
  // New unified fields
  id?: string;
  operation_id?: string;
  operation_type?: string;
  operation_data?: any;
  created_at?: string;
  user_id?: string;
  user_email?: string;
  status?: string;
  credits?: string | number;
  uid?: string;
  username?: string;
  phone_sn?: string;
  brand?: string;
  model?: string;
  imei?: string;
  credit?: string | number;
  time?: string;
  android?: string;
  baseband?: string;
  carrier?: string;
  security_patch?: string;
  hwid?: string;
  // Legacy properties (uppercase)
  OprationID?: string;
  OprationTypes?: string;
  Phone_SN?: string;
  Brand?: string;
  Model?: string;
  Imei?: string;
  UserName?: string;
  Credit?: string;
  Time?: string;
  Status?: string;
  Android?: string;
  Baseband?: string;
  Carrier?: string;
  Security_Patch?: string;
  UID?: string;
  Hwid?: string;
  LogOpration?: string | null;
}

export interface ServerApiData {
  id: string;
  IMEI?: string;
  ImeiSign?: string;
  Model?: string;
  PubKey?: string; 
  PubKeySign?: string;
  PhoneSN?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
}
