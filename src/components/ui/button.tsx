import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "text-white rounded-full shadow-[0_4px_20px_rgba(255,47,178,0.35)] hover:shadow-[0_8px_32px_rgba(255,47,178,0.5)] active:scale-[0.97]",
        destructive: 
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full",
        outline: 
          "bg-white border border-gray-200 text-foreground hover:bg-gray-50 hover:border-pink-hot/30 rounded-full",
        secondary: 
          "bg-[#0B0B10] text-white hover:bg-[#1A1A1F] rounded-full",
        ghost: 
          "hover:bg-gray-100 hover:text-foreground rounded-full",
        link: 
          "text-pink-hot relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-current after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left",
      },
      size: {
        default: "h-11 px-7 py-2 text-[15px]",
        sm: "h-9 px-5 text-sm",
        lg: "h-13 px-10 py-4 text-base",
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
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Apply gradient background for default variant
    const gradientStyle = variant === "default" || variant === undefined 
      ? { background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 55%, #FF6BD6 100%)', ...style }
      : style;
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        style={gradientStyle}
        {...props} 
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };