import { cn } from "@/lib/cn";

/** "Beyond the Frame.": italic article, safelight full stop. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("display whitespace-nowrap tracking-[-0.03em]", className)}>
      Beyond <span className="italic">the</span> Frame<span className="text-safelight">.</span>
    </span>
  );
}
