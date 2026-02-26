import { useState } from 'react';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api } from '@/lib/api';

export interface CreateWorkspacePageProps {
  onNavigate: (path: string) => void;
}

interface WorkspaceCreatedResult {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  inviteLink: string;
}

interface FormErrors {
  name?: string;
  nickname?: string;
}

export function CreateWorkspacePage({ onNavigate }: CreateWorkspacePageProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<WorkspaceCreatedResult | null>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = '워크스페이스 이름을 입력해주세요';
    }
    if (!nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload: Record<string, string> = { name, nickname };
      if (description.trim()) {
        payload.description = description;
      }

      const response = await api.post<WorkspaceCreatedResult>('/workspaces', payload);
      setResult(response);
    } catch {
      setApiError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyInviteLink() {
    if (result?.inviteLink) {
      await navigator.clipboard.writeText(result.inviteLink);
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <h2 className="text-2xl font-bold">워크스페이스가 생성되었습니다!</h2>

          <div className="rounded-lg border p-4">
            <p className="mt-1 break-all font-mono text-sm">
              초대 링크: {result.inviteLink}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleCopyInviteLink}>
              복사
            </Button>
            <Button onClick={() => onNavigate(`/${result.slug}`)}>
              시작하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">워크스페이스 만들기</h2>

        <div className="space-y-2">
          <label htmlFor="workspace-name" className="text-sm font-medium">
            워크스페이스 이름
          </label>
          <Input
            id="workspace-name"
            placeholder="ABC테크 개발팀"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="workspace-description" className="text-sm font-medium">
            설명
          </label>
          <Input
            id="workspace-description"
            placeholder="팀 점심 모임"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="workspace-nickname" className="text-sm font-medium">
            닉네임
          </label>
          <Input
            id="workspace-nickname"
            placeholder="홍길동"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            aria-invalid={!!errors.nickname}
          />
          {errors.nickname && (
            <p className="text-sm text-destructive">{errors.nickname}</p>
          )}
        </div>

        {apiError && (
          <p className="text-sm text-destructive">{apiError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '생성 중...' : '만들기'}
        </Button>
      </form>
    </div>
  );
}
