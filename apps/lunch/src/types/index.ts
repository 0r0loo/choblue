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
