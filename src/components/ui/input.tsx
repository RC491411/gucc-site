import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md bg-ink/40 px-3 text-sm text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] placeholder:text-steel focus-visible:shadow-[0_0_0_1px_rgb(242_193_75_/_0.7)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
