export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      certsave: {
        Row: {
          Email: string | null
          Hwid: string | null
          Imei: string
          ImeiSign: string | null
          Model: string | null
          Notes: string | null
          Phone_sn: string
          PubKey: string | null
          PubKeySign: string | null
          uid: string
        }
        Insert: {
          Email?: string | null
          Hwid?: string | null
          Imei: string
          ImeiSign?: string | null
          Model?: string | null
          Notes?: string | null
          Phone_sn: string
          PubKey?: string | null
          PubKeySign?: string | null
          uid: string
        }
        Update: {
          Email?: string | null
          Hwid?: string | null
          Imei?: string
          ImeiSign?: string | null
          Model?: string | null
          Notes?: string | null
          Phone_sn?: string
          PubKey?: string | null
          PubKeySign?: string | null
          uid?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          count_refund: number | null
          email: string
          id: string
          model: string | null
          number_discounts: number | null
          uid: string
        }
        Insert: {
          count_refund?: number | null
          email: string
          id?: string
          model?: string | null
          number_discounts?: number | null
          uid: string
        }
        Update: {
          count_refund?: number | null
          email?: string
          id?: string
          model?: string | null
          number_discounts?: number | null
          uid?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          inserted_at: string | null
          key: string
          value: string | null
        }
        Insert: {
          inserted_at?: string | null
          key: string
          value?: string | null
        }
        Update: {
          inserted_at?: string | null
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          expiry_at: string | null
          id: string
          percentage: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          expiry_at?: string | null
          id?: string
          percentage?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          expiry_at?: string | null
          id?: string
          percentage?: string | null
          status?: string | null
        }
        Relationships: []
      }
      operations: {
        Row: {
          android: string | null
          baseband: string | null
          brand: string | null
          carrier: string | null
          credit: string | null
          hwid: string | null
          imei: string | null
          model: string | null
          operation_id: string
          operation_type: string
          phone_sn: string | null
          security_patch: string | null
          status: string | null
          time: string | null
          uid: string | null
          username: string | null
        }
        Insert: {
          android?: string | null
          baseband?: string | null
          brand?: string | null
          carrier?: string | null
          credit?: string | null
          hwid?: string | null
          imei?: string | null
          model?: string | null
          operation_id: string
          operation_type: string
          phone_sn?: string | null
          security_patch?: string | null
          status?: string | null
          time?: string | null
          uid?: string | null
          username?: string | null
        }
        Update: {
          android?: string | null
          baseband?: string | null
          brand?: string | null
          carrier?: string | null
          credit?: string | null
          hwid?: string | null
          imei?: string | null
          model?: string | null
          operation_id?: string
          operation_type?: string
          phone_sn?: string | null
          security_patch?: string | null
          status?: string | null
          time?: string | null
          uid?: string | null
          username?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          method: string
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          method: string
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          method?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          features: string | null
          id: string
          name_plan: string
          perks: string | null
          price: string | null
        }
        Insert: {
          features?: string | null
          id?: string
          name_plan: string
          perks?: string | null
          price?: string | null
        }
        Update: {
          features?: string | null
          id?: string
          name_plan?: string
          perks?: string | null
          price?: string | null
        }
        Relationships: []
      }
      server_history: {
        Row: {
          amount: number | null
          distributor_id: string
          id: string
          operation_details: Json
          operation_type: string
          status: string
          target_user_id: string | null
          timestamp: string
        }
        Insert: {
          amount?: number | null
          distributor_id: string
          id?: string
          operation_details?: Json
          operation_type: string
          status?: string
          target_user_id?: string | null
          timestamp?: string
        }
        Update: {
          amount?: number | null
          distributor_id?: string
          id?: string
          operation_details?: Json
          operation_type?: string
          status?: string
          target_user_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_history_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_history_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          numeric_value: number | null
          object_name: string
          title: string | null
          value: boolean | null
        }
        Insert: {
          key: string
          numeric_value?: number | null
          object_name: string
          title?: string | null
          value?: boolean | null
        }
        Update: {
          key?: string
          numeric_value?: number | null
          object_name?: string
          title?: string | null
          value?: boolean | null
        }
        Relationships: []
      }
      supported_models: {
        Row: {
          brand: string
          carrier: string | null
          id: string
          model: string
          operation: string | null
          security: string | null
        }
        Insert: {
          brand: string
          carrier?: string | null
          id?: string
          model: string
          operation?: string | null
          security?: string | null
        }
        Update: {
          brand?: string
          carrier?: string | null
          id?: string
          model?: string
          operation?: string | null
          security?: string | null
        }
        Relationships: []
      }
      two_factor_verification: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      update: {
        Row: {
          changelog: string | null
          direct_download: boolean | null
          download_count: number | null
          link: string | null
          name: string | null
          release_at: string | null
          varizon: string
        }
        Insert: {
          changelog?: string | null
          direct_download?: boolean | null
          download_count?: number | null
          link?: string | null
          name?: string | null
          release_at?: string | null
          varizon: string
        }
        Update: {
          changelog?: string | null
          direct_download?: boolean | null
          download_count?: number | null
          link?: string | null
          name?: string | null
          release_at?: string | null
          varizon?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          activate: string | null
          block: string | null
          country: string | null
          credits: string | null
          distributor_id: string | null
          email: string
          email_type: string | null
          expiry_time: string | null
          hwid: string | null
          id: string
          name: string | null
          otp_secret: string | null
          password: string
          phone: string | null
          start_date: string | null
          two_factor_enabled: boolean | null
          uid: string
          user_type: string | null
        }
        Insert: {
          activate?: string | null
          block?: string | null
          country?: string | null
          credits?: string | null
          distributor_id?: string | null
          email: string
          email_type?: string | null
          expiry_time?: string | null
          hwid?: string | null
          id: string
          name?: string | null
          otp_secret?: string | null
          password: string
          phone?: string | null
          start_date?: string | null
          two_factor_enabled?: boolean | null
          uid: string
          user_type?: string | null
        }
        Update: {
          activate?: string | null
          block?: string | null
          country?: string | null
          credits?: string | null
          distributor_id?: string | null
          email?: string
          email_type?: string | null
          expiry_time?: string | null
          hwid?: string | null
          id?: string
          name?: string | null
          otp_secret?: string | null
          password?: string
          phone?: string | null
          start_date?: string | null
          two_factor_enabled?: boolean | null
          uid?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits_with_discount: {
        Args: {
          pxu: string
          pxe: string
          pxm: string
          pxc: string
          pxoi: string
          pxot: string
          pxps: string
          pxbr: string
          pxim: string
          pxst: string
          pxan: string
          pxba: string
          pxca: string
          pxse: string
          pxhw: string
        }
        Returns: string
      }
      delete_auth_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_counter: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_distributor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_login_status: {
        Args: { loui: string; lohw: string; lova: string }
        Returns: Json
      }
      verify_otp: {
        Args: { user_id: string; otp_code: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
