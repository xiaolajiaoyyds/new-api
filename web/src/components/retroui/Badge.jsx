import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-bold border-2 border-black dark:border-white text-xs transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[#ffdb33] text-black dark:bg-[rgb(0,95,190)] dark:text-white',
        secondary: 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100',
        outline: 'bg-transparent text-black dark:text-zinc-100',
        primary:
          'bg-[#ffdb33] text-black dark:bg-[rgb(0,95,190)] dark:text-white',
        success: 'bg-green-400 text-black',
        warning: 'bg-orange-400 text-black',
        danger: 'bg-red-400 text-white',
        info: 'bg-blue-400 text-black',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

const Badge = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
