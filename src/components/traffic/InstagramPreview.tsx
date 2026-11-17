import { useRef, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  ExternalLink,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Send,
} from 'lucide-react';

export function InstagramPreview({ username, slides, caption, cta, sponsored, alt, href, testId }: {
  username: string;
  slides: string[];
  caption: string;
  cta?: string | null;
  sponsored?: boolean;
  alt: string;
  href?: string | null; // link do post publicado, mostrado quando a arte só existe no Instagram
  testId?: string;
}) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const i = Math.min(index, slides.length - 1);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  // A seta da ponta some ao chegar no fim: o foco passa para a outra, em vez de cair no body.
  const goTo = (to: number) => {
    setIndex(to);
    if (to === 0) requestAnimationFrame(() => nextRef.current?.focus());
    else if (to === slides.length - 1) requestAnimationFrame(() => prevRef.current?.focus());
  };
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
          <img
            src={slides[i]}
            alt={slides.length > 1 ? `${alt} (imagem ${i + 1} de ${slides.length})` : alt}
            className="block h-auto w-full"
          />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 px-6 text-center text-sm text-foreground">
            <ImageIcon aria-hidden="true" className="h-8 w-8" />
            <p>A arte deste post está no Instagram e vai como está.</p>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver o post no Instagram
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {slides.length > 1 && (
          <>
            {i > 0 && (
              <button
                type="button"
                ref={prevRef}
                data-testid="ig-prev"
                aria-label="Imagem anterior"
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(i - 1);
                }}
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
            {i < slides.length - 1 && (
              <button
                type="button"
                ref={nextRef}
                data-testid="ig-next"
                aria-label="Próxima imagem"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(i + 1);
                }}
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
            <span className="absolute right-2 top-2 rounded-full bg-foreground/85 px-2 py-0.5 text-xs text-background">
              {i + 1}/{slides.length}
            </span>
          </>
        )}
      </div>

      {cta && (
        <div data-testid="ig-cta" className="flex items-center justify-between gap-2 border-b px-3 py-2.5 text-sm font-semibold">
          <span className="min-w-0 break-words">{cta}</span>
          <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0" />
        </div>
      )}

      <div className="relative flex items-center gap-4 px-3 pt-2.5">
        <Heart aria-hidden="true" className="h-6 w-6 shrink-0" />
        <MessageCircle aria-hidden="true" className="h-6 w-6 shrink-0" />
        <Send aria-hidden="true" className="h-6 w-6 shrink-0" />
        {slides.length > 1 && (
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 gap-1">
            {slides.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`h-1.5 w-1.5 rounded-full ${dotIndex === i ? 'bg-accent' : 'bg-muted-foreground/40'}`}
              />
            ))}
          </div>
        )}
        <Bookmark aria-hidden="true" className="ml-auto h-6 w-6 shrink-0" />
      </div>

      {caption.trim() && (
        <div className="px-3 pb-3 pt-2 text-sm">
          <p ref={captionRef} tabIndex={-1} data-testid="ig-caption" className={`outline-none whitespace-pre-line break-words ${expanded ? '' : 'line-clamp-2'}`}>
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
                requestAnimationFrame(() => captionRef.current?.focus()); // o "mais" some; o foco fica no texto
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
