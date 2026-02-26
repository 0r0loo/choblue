import { Button } from '@choblue/ui/button';

export interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold">오늘뭐먹을래</h1>
        <p className="mt-2 text-muted-foreground">
          팀 점심 함께 쉽고 빠르게
        </p>
      </div>

      <Button
        size="lg"
        onClick={() => onNavigate('/create')}
      >
        워크스페이스 만들기
      </Button>

      <p className="text-sm text-muted-foreground">
        이미 초대 링크를 받으셨나요? 링크를 통해 바로 참여할 수 있습니다.
      </p>

      <div className="grid w-full max-w-md gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">워크스페이스를 생성하세요</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">팀원에게 링크를 공유하세요</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">점심 모집을 시작하세요</p>
        </div>
      </div>
    </div>
  );
}
