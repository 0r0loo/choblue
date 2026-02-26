import { Card, CardHeader, CardContent } from '@choblue/ui/card';
import { Badge } from '@choblue/ui/badge';
import type { LunchPost } from '@/types';

export interface PostCardProps {
  post: LunchPost;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const currentParticipants = post.participations.length;
  const statusLabel = post.status === 'open' ? '모집중' : '마감';
  const statusVariant = post.status === 'open' ? 'primary' : 'secondary';

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-lg font-semibold">{post.menu}</span>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        {post.restaurant && <p>{post.restaurant}</p>}
        <p>{post.time}</p>
        <p>{currentParticipants}/{post.maxParticipants}</p>
        <p>{post.author.nickname}</p>
      </CardContent>
    </Card>
  );
}
