export type SchoolAnnouncementStatus = "draft" | "published" | "archived";

export interface ManageableSchoolAnnouncement {
  id: string;
  organization_id: string;
  class_group_id: string | null;
  class_group_name: string | null;
  title: string;
  body: string;
  status: SchoolAnnouncementStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ParentSchoolAnnouncement {
  id: string;
  organization_id: string;
  organization_name: string;
  class_group_id: string | null;
  class_group_name: string | null;
  title: string;
  body: string;
  published_at: string;
  created_at: string;
  read_at: string | null;
}
