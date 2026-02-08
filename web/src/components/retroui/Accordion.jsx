import React, { createContext, useContext, useState } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';
import { ChevronDown } from 'lucide-react';

const AccordionContext = createContext();

const Accordion = ({ children, className, defaultValue = [], multiple = false }) => {
  const [openItems, setOpenItems] = useState(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );

  const toggle = (value) => {
    if (multiple) {
      setOpenItems((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      setOpenItems((prev) => (prev.includes(value) ? [] : [value]));
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ value, children, className }) => {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <div className={cn(
        'rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-200',
        isOpen ? 'shadow-md ring-1 ring-zinc-200 dark:ring-zinc-800' : 'shadow-sm',
        className
    )}>
      {children}
    </div>
  );
};

const AccordionTrigger = ({ children, className, value }) => {
  const { openItems, toggle } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      className={cn(
        'flex w-full items-center justify-between px-6 py-4 text-left font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-800/50',
        className
      )}
      onClick={() => toggle(value)}
    >
      <span className="flex-1 text-base">{children}</span>
      <ChevronDown
        className={cn(
          'h-5 w-5 transition-transform duration-300 text-zinc-400',
          isOpen && 'rotate-180 text-amber-500'
        )}
      />
    </button>
  );
};

const AccordionContent = ({ children, className, value }) => {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={cn(
        'px-6 pb-6 pt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/50',
        className
    )}>
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };