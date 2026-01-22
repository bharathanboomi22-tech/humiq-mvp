import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl px-4 py-3.5 text-base text-foreground",
          "bg-white/80 border border-input",
          "ring-offset-background transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-[#9AA0A6] placeholder:not-italic",
          "focus-visible:outline-none focus-visible:border-[#5B8CFF] focus-visible:ring-[3px] focus-visible:ring-[rgba(91,140,255,0.14)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };