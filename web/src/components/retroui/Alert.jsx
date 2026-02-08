import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-2xl border px-5 py-4 flex items-start gap-4 shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        info: 'bg-blue-50/50 text-blue-900 dark:bg-blue-900/10 dark:text-blue-200 border-blue-100 dark:border-blue-900/20',
        success: 'bg-green-50/50 text-green-900 dark:bg-green-900/10 dark:text-green-200 border-green-100 dark:border-green-900/20',
        warning: 'bg-amber-50/50 text-amber-900 dark:bg-amber-900/10 dark:text-amber-200 border-amber-100 dark:border-amber-900/20',
        danger: 'bg-red-50/50 text-red-900 dark:bg-red-900/10 dark:text-red-200 border-red-100 dark:border-red-900/20',
        neutral: 'bg-zinc-50/50 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  neutral: Info,
};

const Alert = React.forwardRef(({ className, variant = 'info', children, icon, ...props }, ref) => {
  const IconComponent = icon || iconMap[variant];

  return (
    <div
      className={cn(alertVariants({ variant, className }))}
      ref={ref}
      {...props}
    >
      <div className="shrink-0 mt-0.5">
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <IconComponent className="h-5 w-5 opacity-80" />
        )}
      </div>
      <div className="flex-1 text-sm leading-relaxed font-medium">{children}</div>
    </div>
  );
});

Alert.displayName = 'Alert';

export { Alert, alertVariants };
