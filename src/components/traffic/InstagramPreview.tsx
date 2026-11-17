import { useState } from 'react';
import { Bookmark, Heart, ImageIcon, MessageCircle, MoreHorizontal, Send } from 'lucide-react';

export function InstagramPreview({ username, slides, caption, sponsored, alt, testId }: {
  username: string;
  slides: string[];
  caption: string;
  cta?: string | null;
  sponsored?: boolean;
  alt: string;
  testId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongCaption = caption.length > 125 || caption.includes('\n');

  return (
    <article data-testid={testId} className="w-full max-w-[420px] overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{username}</p>
          {sponsored && <p className="text-xs text-muted-foreground">Patrocinado</p>}
        </div>
        <MoreHorizontal aria-hidden="true" className="ml-auto h-5 w-5 shrink-0" />
      </div>

      <div className="relative bg-muted">
        {slides.length > 0 ? (
          <img src={slides[0]} alt={alt} className="block h-auto w-full" />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageIcon aria-hidden="true" className="h-8 w-8" />
            Arte no Instagram
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 px-3 pt-2.5">
        <Heart aria-hidden="true" className="h-6 w-6" />
        <MessageCircle aria-hidden="true" className="h-6 w-6" />
        <Send aria-hidden="true" className="h-6 w-6" />
        <Bookmark aria-hidden="true" className="ml-auto h-6 w-6" />
      </div>

      {caption.trim() && (
        <div className="px-3 pb-3 pt-2 text-sm">
          <p data-testid="ig-caption" className={`whitespace-pre-line break-words ${expanded ? '' : 'line-clamp-2'}`}>
            <span className="font-semibold">{username}</span>{' '}{caption}
          </p>
          {hasLongCaption && !expanded && (
            <button
              type="button"
              data-testid="ig-more"
              aria-expanded={false}
              className="text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(true);
              }}
            >
              mais
            </button>
          )}
        </div>
      )}
    </article>
  );
}
