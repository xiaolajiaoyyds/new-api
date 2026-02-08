import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../helpers/utils';

const TabsContext = createContext();

const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    if (value === undefined) setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className }) => (
  <div className={cn('inline-flex items-center gap-1', className)}>
    {children}
  </div>
);

const TabsTrigger = ({ value, children, className, disabled }) => {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type='button'
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-bold border-2 border-black dark:border-white transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-[#ffdb33] text-black dark:bg-[rgb(0,95,190)] dark:text-white shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)]'
          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700',
        className,
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (context.value !== value) return null;

  return <div className={cn('mt-6', className)}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
