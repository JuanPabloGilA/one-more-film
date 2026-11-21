'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type FilterOption<T> = { value: T; label: string };

/** A labelled single-choice dropdown for the catalogue filter bar. */
export const FilterSelect = <T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
  align = 'start',
  contentClassName,
}: {
  id: string;
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  align?: 'start' | 'end';
  contentClassName?: string;
}) => (
  <div className="catalogue-filter">
    <label htmlFor={id}>{label}</label>
    <Select
      items={options}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger id={id} className="w-full data-[size=default]:h-11">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align={align}
        alignItemWithTrigger={false}
        className={cn('max-h-[min(320px,var(--available-height))]', contentClassName)}
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="min-h-11">
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
