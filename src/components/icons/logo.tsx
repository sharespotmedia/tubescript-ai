import { PlayCircle } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <PlayCircle className="h-10 w-10 text-sidebar-primary" />
      <div>
        <h1 className="font-headline text-xl font-bold text-sidebar-foreground">
          TubeScript AI
        </h1>
        <p className="text-xs text-sidebar-foreground/80">Powered by AI</p>
      </div>
    </div>
  );
}
