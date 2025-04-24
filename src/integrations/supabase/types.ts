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
      operations: {
        Row: {
          android: string | null
          baseband: string | null
          brand: string | null
          carrier: string | null
          created_at: string | null
          credit: string | null
          hwid: string | null
          id: string
          imei: string | null
          log_operation: string | null
          model: string | null
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
          created_at?: string | null
          credit?: string | null
          hwid?: string | null
          id?: string
          imei?: string | null
          log_operation?: string | null
          model?: string | null
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
          created_at?: string | null
          credit?: string | null
          hwid?: string | null
          id?: string
          imei?: string | null
          log_operation?: string | null
          model?: string | null
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
      [_ in never]: never
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
