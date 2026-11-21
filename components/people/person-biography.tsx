'use client';
import { useId, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PersonBiography = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const biography = text.trim();
  const canExpand = biography.length > 420;
  const excerpt = biography
    .slice(0, 420)
    .replace(/\s+\S*$/, '')
    .trimEnd();
  const visible = canExpand && !expanded ? `${excerpt}…` : biography;
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <>
      <div id={contentId}>
        {visible ? (
          visible.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>A biography has not been added to TMDB yet.</p>
        )}
      </div>
      {canExpand && (
        <Button
          variant="link"
          className="gap-2 px-0 text-[var(--brand-accent)]"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'See less' : 'See more'}
          <Icon size={16} aria-hidden="true" />
        </Button>
      )}
    </>
  );
};
