export type PreferredChannel = "whatsapp" | "email" | "in_app";

export interface UserChannelsRow {
  user_id: string;
  whatsapp_number_e164: string | null;
  whatsapp_opt_in: boolean;
  whatsapp_opt_in_at: string | null;
  preferred_channel: PreferredChannel;
  created_at: string;
  updated_at: string;
}

export interface MessageLogRow {
  id: string;
  channel: string;
  to: string;
  template_name: string | null;
  payload: Record<string, unknown>;
  status: "sent" | "delivered" | "read" | "failed";
  provider_message_id: string | null;
  cohort_id: string | null;
  recipient_user_id: string | null;
  created_at: string;
}
