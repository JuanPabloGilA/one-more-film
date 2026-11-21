'use client';
import type { RefObject } from 'react';
import Form from 'next/form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { routes } from '@/lib/links';
import { MAX_QUERY_LENGTH } from '@/lib/params';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const MobileSearch = ({
  onClose,
  triggerRef,
}: {
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) => (
  <Dialog
    open
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <DialogContent finalFocus={triggerRef}>
      <DialogHeader>
        <DialogTitle>Find a film</DialogTitle>
        <DialogDescription>Search by movie title.</DialogDescription>
      </DialogHeader>
      <Form action={routes.home} role="search" className="flex gap-2" onSubmit={onClose}>
        <label className="sr-only" htmlFor="mobile-query">
          Search films
        </label>
        <Input
          id="mobile-query"
          name="q"
          placeholder="Try Dune"
          maxLength={MAX_QUERY_LENGTH}
          autoFocus
        />
        <Button type="submit">
          <Search aria-hidden="true" /> Search
        </Button>
      </Form>
    </DialogContent>
  </Dialog>
);
