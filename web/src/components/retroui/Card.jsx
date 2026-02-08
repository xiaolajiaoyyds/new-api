import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';

const cardVariants = cva(
  'border-2 border-black dark:border-white transition-all',
  {
    variants: {
      variant: {
        default:
          'bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.15)]',
        flat: 'bg-zinc-50 dark:bg-zinc-900 text-black dark:text-zinc-100 shadow-none',
        interactive:
          'bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.15)] hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);

const Card = React.forwardRef(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn('flex flex-col space-y-1.5 mb-4', className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    className={cn('text-lg font-bold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <p
      className={cn('text-sm text-zinc-600 dark:text-zinc-400', className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div className={cn('', className)} ref={ref} {...props}>
      {children}
    </div>
  ),
);
CardContent.displayName = 'CardContent';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
