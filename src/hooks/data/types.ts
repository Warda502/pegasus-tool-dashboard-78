
export interface User {
  id: string;
  email: string;
  name: string;
  uid: string;
  password: string;
  phone?: string;
  country?: string;
  activate: string;
  block: string;
  credits: string;
  user_type: string;
  email_type: string;
  expiry_time?: string;
  start_date?: string;
  hwid?: string;
  
  // Legacy fields (for compatibility)
  Name: string;
  Email: string;
  Password: string;
  Phone: string;
  Country: string;
  Activate: string;
  Block: string;
  Credits: string;
  User_Type: string;
  Email_Type: string;
  Expiry_Time: string;
  Start_Date: string;
  Hwid: string;
  UID: string;
  [key: string]: any;
}

export interface Operation {
  operation_id?: string;
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
  LogOpration?: string;
  [key: string]: any;
}

export interface SharedDataState {
  users: User[];
  operations: Operation[];
  isLoading: boolean;
}

export interface SharedDataActions {
  refreshData: () => void;
  addCreditToUser: (userId: string, creditsToAdd: number) => Promise<boolean>;
  refundOperation: (operation: Operation) => Promise<boolean>;
}

export type SharedDataContextType = SharedDataState & SharedDataActions;
