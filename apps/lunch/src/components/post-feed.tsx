import type { LunchPost } from '@/types';
import { PostCard } from './post-card';

export interface PostFeedProps {
  posts: LunchPost[];
  onPostClick: (postId: string) => void;
}

export function PostFeed({ posts, onPostClick }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>아직 모집글이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick(post.id)}
        />
      ))}
    </div>
  );
}
