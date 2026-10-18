import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningNotification } from "../types/learning-notification.types";

type RpcResult = { data: unknown; error: { message: string } | null };
const client = supabase as unknown as {
  rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult>;
};

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const learningNotificationsRepository = {
  async list(limit = 50): Promise<LearningNotification[]> {
    const data = await rpc<unknown>("list_learning_notifications", { p_limit: limit });
    return Array.isArray(data) ? data as LearningNotification[] : [];
  },
  async countUnread(): Promise<number> {
    const count = await rpc<number>("count_unread_learning_notifications", {});
    return Number.isFinite(Number(count)) ? Number(count) : 0;
  },
  async markRead(notificationId: string): Promise<boolean> {
    return rpc<boolean>("mark_learning_notification_read", { p_notification_id: notificationId });
  },
  async markAllRead(): Promise<number> {
    const count = await rpc<number>("mark_all_learning_notifications_read", {});
    return Number.isFinite(Number(count)) ? Number(count) : 0;
  },
};
