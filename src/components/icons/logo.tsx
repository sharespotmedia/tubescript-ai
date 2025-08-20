import { Clapperboard } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 p-2 text-lg font-semibold tracking-tight text-sidebar-foreground">
      <Clapperboard className="h-8 w-8 text-sidebar-accent" />
      <h1 className="font-headline text-xl">TubeScript AI</h1>
    </div>
  );
}
