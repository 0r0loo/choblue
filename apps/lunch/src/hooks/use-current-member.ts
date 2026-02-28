import { useQuery } from '@tanstack/react-query';
import { memberQueries } from '@/lib/queries';

export function useCurrentMember(workspaceSlug: string) {
  return useQuery(memberQueries.current(workspaceSlug));
}
