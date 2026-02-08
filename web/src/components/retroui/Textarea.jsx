import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';

const textareaVariants = cva(
  'flex w-full rounded-xl border border-zinc-200 bg-gray-50/50 px-4 py-3 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-amber-500 transition-all duration-200 resize-none',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-white dark:bg-zinc-900 border-transparent shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Textarea = React.forwardRef(({ className, variant, label, rows = 4, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 ml-1">{label}</label>
      )}
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        rows={rows}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };