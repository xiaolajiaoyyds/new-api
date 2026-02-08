import React from 'react';
import { cn } from '../../helpers/utils';
import { Inbox } from 'lucide-react';

const Empty = React.forwardRef(({ className, icon, description, children, ...props }, ref) => {
  const IconComponent = icon || Inbox;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <IconComponent className="w-10 h-10 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
        )}
      </div>
      {description && (
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-base">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
});

Empty.displayName = 'Empty';

export { Empty };