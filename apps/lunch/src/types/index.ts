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
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  inviteLink: string;
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
