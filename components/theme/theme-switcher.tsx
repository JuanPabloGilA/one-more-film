'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Choose theme"
            title="Theme"
          />
        }
      >
        <Sun className="dark:hidden" aria-hidden="true" />
        <Moon className="hidden dark:block" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme ?? 'light'} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light" className="min-h-11 gap-3 px-3">
              <Sun aria-hidden="true" /> Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="min-h-11 gap-3 px-3">
              <Moon aria-hidden="true" /> Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className="min-h-11 gap-3 px-3">
              <Monitor aria-hidden="true" /> System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
