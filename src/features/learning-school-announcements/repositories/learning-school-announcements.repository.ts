import { supabase } from "@/core/infrastructure/supabase/client";
import type { ManageableSchoolAnnouncement, ParentSchoolAnnouncement } from "../types/learning-school-announcement.types";

type RpcResult = { data: unknown; error: { message: string } | null };
const client = supabase as unknown as {
  rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult>;
};

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

function rows<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

export const learningSchoolAnnouncementsRepository = {
  async listManageable(organizationId: string): Promise<ManageableSchoolAnnouncement[]> {
    return rows(await rpc<unknown>("list_manageable_learning_school_announcements", {
      p_organization_id: organizationId,
    }));
  },
  async createDraft(input: {
    organizationId: string;
    classGroupId: string | null;
    title: string;
    body: string;
  }): Promise<string> {
    const id = await rpc<unknown>("create_learning_school_announcement", {
      p_organization_id: input.organizationId,
      p_class_group_id: input.classGroupId,
      p_title: input.title,
      p_body: input.body,
    });
    if (typeof id !== "string" || !id) throw new Error("The draft announcement was not saved.");
    return id;
  },
  async publish(announcementId: string): Promise<boolean> {
    return rpc<boolean>("publish_learning_school_announcement", {
      p_announcement_id: announcementId,
    });
  },
  async listForParent(limit = 50): Promise<ParentSchoolAnnouncement[]> {
    return rows(await rpc<unknown>("list_learning_parent_school_announcements", {
      p_limit: limit,
    }));
  },
  async markParentRead(announcementId: string): Promise<boolean> {
    return rpc<boolean>("mark_learning_parent_school_announcement_read", {
      p_announcement_id: announcementId,
    });
  },
};
