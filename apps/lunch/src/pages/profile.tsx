import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api, getErrorMessage } from '@/lib/api';
import { memberQueries } from '@/lib/queries';
import { memberKeys } from '@/lib/query-keys';
import type { Member } from '@/types';

export interface ProfilePageProps {
  workspaceId: string;
  onNavigate: (path: string) => void;
}

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 10;

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const queryClient = useQueryClient();

  const { data: member, isLoading, error: fetchError } = useQuery(
    memberQueries.me(),
  );

  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form when member loads
  if (member && !initialized) {
    setNickname(member.nickname);
    setOriginalNickname(member.nickname);
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: (payload: { nickname: string }) =>
      api.patch<Member>('/members/me', payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(memberKeys.me(), updated);
      setOriginalNickname(updated.nickname);
      setSuccessMessage('닉네임이 변경되었습니다');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (fetchError || !member) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-danger">
          {fetchError
            ? getErrorMessage(fetchError, '데이터를 불러오는 중 오류가 발생했습니다.')
            : '데이터를 찾을 수 없습니다.'}
        </p>
      </div>
    );
  }

  const isChanged = nickname !== originalNickname;

  function validate(): boolean {
    if (nickname.length < NICKNAME_MIN_LENGTH) {
      setValidationError(`${NICKNAME_MIN_LENGTH}자 이상 입력해주세요`);
      return false;
    }
    if (nickname.length > NICKNAME_MAX_LENGTH) {
      setValidationError(`${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요`);
      return false;
    }
    setValidationError(null);
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    updateMutation.mutate({ nickname });
  }

  function handleBackClick(e: React.MouseEvent) {
    e.preventDefault();
    onNavigate('/settings');
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <a
          href="/settings"
          onClick={handleBackClick}
          className="text-sm text-muted-foreground hover:underline"
        >
          설정으로 돌아가기
        </a>

        <h2 className="text-2xl font-bold">프로필</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium">
              닉네임
            </label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setValidationError(null);
                setSuccessMessage(null);
                updateMutation.reset();
              }}
            />
            {validationError && (
              <p className="text-sm text-danger">{validationError}</p>
            )}
          </div>

          <Button type="submit" disabled={!isChanged}>
            저장
          </Button>

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          {updateMutation.error && (
            <p className="text-sm text-danger">
              {getErrorMessage(updateMutation.error, '닉네임 변경 중 오류가 발생했습니다.')}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
