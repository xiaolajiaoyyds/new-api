import React, { createContext, useContext } from 'react';
import { cn } from '../../helpers/utils';

const RadioGroupContext = createContext();

const RadioGroup = ({ value, onChange, children, className, type = 'default' }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onChange, type }}>
      <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
};

const Radio = ({ value, children, className, disabled }) => {
  const context = useContext(RadioGroupContext);
  const isSelected = context?.value === value;
  const isButton = context?.type === 'button';

  const handleClick = () => {
    if (!disabled) {
      context?.onChange?.({ target: { value } });
    }
  };

  if (isButton) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border border-transparent',
          isSelected
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10'
            : 'bg-gray-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div
        onClick={handleClick}
        className={cn(
          'w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center transition-all',
          isSelected && 'border-amber-500 bg-amber-500'
        )}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{children}</span>
    </label>
  );
};

export { RadioGroup, Radio };