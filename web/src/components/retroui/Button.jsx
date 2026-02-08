import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-bold border-2 border-black dark:border-white transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[#ffdb33] text-black dark:bg-[rgb(0,115,230)] dark:text-white shadow-[3px_3px_0_0_#00] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)] hover:brightness-105',
        secondary:
          'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)] hover:bg-zinc-50 dark:hover:bg-zinc-700',
        destructive:
          'bg-red-500 text-white shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)] hover:bg-red-600',
        outline:
          'bg-transparent text-black dark:text-zinc-100 shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)] hover:bg-zinc-100 dark:hover:bg-zinc-800',
        ghost:
          'border-transparent shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-zinc-100',
        link: 'border-transparent shadow-none text-black dark:text-zinc-100 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
