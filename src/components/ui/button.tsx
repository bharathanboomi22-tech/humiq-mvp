import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-400 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-foreground text-background rounded-full shadow-[0_2px_8px_rgba(11,11,13,0.12)] hover:shadow-[0_4px_16px_rgba(11,11,13,0.16),0_0_0_4px_rgba(11,11,13,0.04)] hover:-translate-y-0.5 active:scale-[0.97]",
        destructive: 
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full",
        outline: 
          "bg-white/55 backdrop-blur-sm border border-white/70 text-foreground hover:bg-white/75 hover:border-border rounded-full",
        secondary: 
          "bg-white/55 backdrop-blur-sm border border-white/70 text-foreground hover:bg-white/75 rounded-full",
        ghost: 
          "hover:bg-white/50 hover:text-foreground rounded-full",
        link: 
          "text-foreground relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-current after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left",
      },
      size: {
        default: "h-11 px-7 py-2 text-[15px]",
        sm: "h-9 px-5 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };