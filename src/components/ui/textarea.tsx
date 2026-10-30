import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-md bg-ink/40 px-3 py-2.5 text-sm text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] placeholder:text-steel focus-visible:shadow-[0_0_0_1px_rgb(242_193_75_/_0.7)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
