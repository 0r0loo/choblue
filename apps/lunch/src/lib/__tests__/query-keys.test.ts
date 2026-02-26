import { describe, it, expect } from 'vitest';
import { workspaceKeys, postKeys } from '@/lib/query-keys';

describe('Query Key Factories', () => {
  // ===========================================================================
  // workspaceKeys
  // ===========================================================================
  describe('workspaceKeys', () => {
    it('should return ["workspaces"] for all', () => {
      expect(workspaceKeys.all).toEqual(['workspaces']);
    });

    it('should return ["workspaces", "detail"] for details', () => {
      const result = workspaceKeys.details();

      expect(result).toEqual(['workspaces', 'detail']);
    });

    it('should return ["workspaces", "detail", id] for detail', () => {
      const workspaceId = 'ws-123';

      const result = workspaceKeys.detail(workspaceId);

      expect(result).toEqual(['workspaces', 'detail', 'ws-123']);
    });

    it('should return ["workspaces", id, "members"] for members', () => {
      const workspaceId = 'ws-456';

      const result = workspaceKeys.members(workspaceId);

      expect(result).toEqual(['workspaces', 'ws-456', 'members']);
    });

    it('should return ["workspaces", "invite", code] for byInviteCode', () => {
      const inviteCode = 'abc-def';

      const result = workspaceKeys.byInviteCode(inviteCode);

      expect(result).toEqual(['workspaces', 'invite', 'abc-def']);
    });

    it('detail key should start with all key (hierarchical prefix)', () => {
      const detail = workspaceKeys.detail('ws-1');

      expect(detail.slice(0, workspaceKeys.all.length)).toEqual(
        workspaceKeys.all,
      );
    });
  });

  // ===========================================================================
  // postKeys
  // ===========================================================================
  describe('postKeys', () => {
    it('should return ["posts"] for all', () => {
      expect(postKeys.all).toEqual(['posts']);
    });

    it('should return ["posts", "list"] for lists', () => {
      const result = postKeys.lists();

      expect(result).toEqual(['posts', 'list']);
    });

    it('should return ["posts", "list", workspaceId, date] for list', () => {
      const workspaceId = 'ws-123';
      const date = '2026-02-26';

      const result = postKeys.list(workspaceId, date);

      expect(result).toEqual(['posts', 'list', 'ws-123', '2026-02-26']);
    });

    it('should return ["posts", "calendar"] for calendars', () => {
      const result = postKeys.calendars();

      expect(result).toEqual(['posts', 'calendar']);
    });

    it('should return ["posts", "calendar", workspaceId, month] for calendar', () => {
      const workspaceId = 'ws-123';
      const month = '2026-02';

      const result = postKeys.calendar(workspaceId, month);

      expect(result).toEqual(['posts', 'calendar', 'ws-123', '2026-02']);
    });

    it('should return ["posts", "detail"] for details', () => {
      const result = postKeys.details();

      expect(result).toEqual(['posts', 'detail']);
    });

    it('should return ["posts", "detail", id] for detail', () => {
      const postId = 'post-789';

      const result = postKeys.detail(postId);

      expect(result).toEqual(['posts', 'detail', 'post-789']);
    });

    it('list key should start with all key (hierarchical prefix)', () => {
      const list = postKeys.list('ws-1', '2026-01-01');

      expect(list.slice(0, postKeys.all.length)).toEqual(postKeys.all);
    });

    it('detail key should start with details prefix', () => {
      const detail = postKeys.detail('post-1');
      const detailsPrefix = postKeys.details();

      expect(detail.slice(0, detailsPrefix.length)).toEqual(detailsPrefix);
    });
  });
});
