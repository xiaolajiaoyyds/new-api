import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';

const inputVariants = cva(
  'flex w-full bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-zinc-500',
  {
    variants: {
      variant: {
        default: 'border border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300',
        filled: 'bg-zinc-100 dark:bg-zinc-800 border-transparent focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300',
        ghost: 'border-none shadow-none bg-transparent focus-visible:ring-0',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Input = React.forwardRef(({ className, variant, size, label, error, icon, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            inputVariants({ variant, size, className }),
            icon && "pl-10"
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input, inputVariants };
