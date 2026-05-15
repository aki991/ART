export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface ClubRow {
  id: string;
  name: string;
  city: string;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ClubMemberRow {
  id: string;
  club_id: string;
  user_id: string;
  role: "member" | "admin";
  joined_at: string;
  profile: {
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface JoinRequestRow {
  id: string;
  club_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  profile: {
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface ClubCreationRequestRow {
  id: string;
  requested_by: string;
  proposed_name: string;
  proposed_city: string;
  proposed_logo_url: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  rejection_reason: string | null;
  created_at: string;
  resolved_at: string | null;
  requester: {
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export interface MembershipSnapshot {
  club: ClubRow;
  role: "member" | "admin";
  joinedAt: string;
}

export interface ClubInfoPatch {
  name?: string;
  city?: string;
  logoUrl?: string | null;
}

export interface ClubCreationInput {
  name: string;
  city: string;
  logoDataUrl: string | null;
}
