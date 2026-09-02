export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          status: string;
          accepting_responses: boolean;
          background_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          description?: string;
          status?: string;
          accepting_responses?: boolean;
          background_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          status?: string;
          accepting_responses?: boolean;
          background_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          form_id: string;
          type: string;
          title: string;
          description: string;
          required: boolean;
          options: string[];
          image_url: string | null;
          correct_option: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          type: string;
          title?: string;
          description?: string;
          required?: boolean;
          options?: string[];
          image_url?: string | null;
          correct_option?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          type?: string;
          title?: string;
          description?: string;
          required?: boolean;
          options?: string[];
          image_url?: string | null;
          correct_option?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      responses: {
        Row: {
          id: string;
          form_id: string;
          submitted_at: string;
          respondent_meta: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          form_id: string;
          submitted_at?: string;
          respondent_meta?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          form_id?: string;
          submitted_at?: string;
          respondent_meta?: Record<string, unknown>;
        };
        Relationships: [];
      };
      answers: {
        Row: {
          id: string;
          response_id: string;
          question_id: string;
          value: unknown;
        };
        Insert: {
          id?: string;
          response_id: string;
          question_id: string;
          value?: unknown;
        };
        Update: {
          id?: string;
          response_id?: string;
          question_id?: string;
          value?: unknown;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
