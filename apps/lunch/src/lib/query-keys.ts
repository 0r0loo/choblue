export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (workspaceId: string, date: string) =>
    [...postKeys.lists(), workspaceId, date] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  calendars: () => [...postKeys.all, 'calendar'] as const,
  calendar: (workspaceId: string, month: string) =>
    [...postKeys.calendars(), workspaceId, month] as const,
};

export const workspaceKeys = {
  all: ['workspaces'] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  members: (id: string) =>
    [...workspaceKeys.all, id, 'members'] as const,
  byInviteCode: (code: string) =>
    [...workspaceKeys.all, 'invite', code] as const,
};

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (postId: string) => [...reviewKeys.lists(), postId] as const,
};

export const memberKeys = {
  all: ['members'] as const,
  me: () => [...memberKeys.all, 'me'] as const,
  current: (workspaceSlug: string) =>
    [...memberKeys.all, 'current', workspaceSlug] as const,
};
