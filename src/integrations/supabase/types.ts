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
          uid?: string
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
      transactions_log: {
        Row: {
          created_at: string | null
          email: string | null
          final_credits: string | null
          id: string
          model: string | null
          original_deduction: string | null
          refund_applied: string | null
          uid: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          final_credits?: string | null
          id?: string
          model?: string | null
          original_deduction?: string | null
          refund_applied?: string | null
          uid?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          final_credits?: string | null
          id?: string
          model?: string | null
          original_deduction?: string | null
          refund_applied?: string | null
          uid?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          activate: string | null
          block: string | null
          country: string | null
          credits: string | null
          email: string
          email_type: string | null
          expiry_time: string | null
          hwid: string | null
          id: string
          name: string | null
          password: string
          phone: string | null
          start_date: string | null
          uid: string
          user_type: string | null
        }
        Insert: {
          activate?: string | null
          block?: string | null
          country?: string | null
          credits?: string | null
          email: string
          email_type?: string | null
          expiry_time?: string | null
          hwid?: string | null
          id: string
          name?: string | null
          password: string
          phone?: string | null
          start_date?: string | null
          uid: string
          user_type?: string | null
        }
        Update: {
          activate?: string | null
          block?: string | null
          country?: string | null
          credits?: string | null
          email?: string
          email_type?: string | null
          expiry_time?: string | null
          hwid?: string | null
          id?: string
          name?: string | null
          password?: string
          phone?: string | null
          start_date?: string | null
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
        Args: { pxu: string; pxc: string; pxm: string; pxe: string }
        Returns: string
      }
      deduct_user_credit: {
        Args: { pxu: string; pxc: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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
