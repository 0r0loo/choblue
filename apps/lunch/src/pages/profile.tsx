import { useState, useEffect } from 'react';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api } from '@/lib/api';

export interface ProfilePageProps {
  workspaceId: string;
  onNavigate: (path: string) => void;
}

interface MemberInfo {
  id: string;
  nickname: string;
  role: string;
  joinedAt: string;
}

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 10;

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMember() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<MemberInfo>('/members/me');
        if (!cancelled) {
          setMember(data);
          setNickname(data.nickname);
          setOriginalNickname(data.nickname);
        }
      } catch {
        if (!cancelled) {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchMember();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error ?? '데이터를 찾을 수 없습니다.'}</p>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setActionError(null);

    if (!validate()) {
      return;
    }

    try {
      const updated = await api.patch<MemberInfo>('/members/me', {
        nickname,
      });
      setMember(updated);
      setOriginalNickname(updated.nickname);
      setSuccessMessage('닉네임이 변경되었습니다');
    } catch {
      setActionError('닉네임 변경 중 오류가 발생했습니다.');
    }
  }

  function handleBackClick(e: React.MouseEvent) {
    e.preventDefault();
    onNavigate('/settings');
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
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
                setActionError(null);
              }}
            />
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
          </div>

          <Button type="submit" disabled={!isChanged}>
            저장
          </Button>

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          {actionError && (
            <p className="text-sm text-destructive">{actionError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
