export interface LunchPostAuthor {
  id: string;
  nickname: string;
}

export interface LunchPostParticipation {
  id: string;
  member: {
    id: string;
    nickname: string;
  };
}

export interface LunchPost {
  id: string;
  menu: string;
  restaurant: string | null;
  date: string;
  time: string;
  maxParticipants: number;
  status: 'open' | 'closed';
  author: LunchPostAuthor;
  participations: LunchPostParticipation[];
}

export interface Review {
  id: string;
  lunchPostId: string;
  memberId: string;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    nickname: string;
  };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  inviteCode: string;
}

export interface Member {
  id: string;
  nickname: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CurrentMember {
  id: string;
  nickname: string;
}

export interface WorkspaceCreatedResult {
  workspace: {
    id: string;
    name: string;
    slug: string;
    inviteCode: string;
  };
  member: {
    id: string;
    nickname: string;
  };
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
}

export interface JoinResult {
  memberId: string;
  workspaceSlug: string;
}

export interface CalendarPost {
  id: string;
  menu: string;
  participantCount: number;
  maxParticipants: number;
}
