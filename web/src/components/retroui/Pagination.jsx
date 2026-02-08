import React from 'react';
import { cn } from '../../helpers/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  total,
  pageSize = 10,
  currentPage = 1,
  onChange,
  className,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const buttonClass = cn(
    'w-10 h-10 flex items-center justify-center font-bold border-2 border-black dark:border-white',
    'transition-all duration-150 bg-white dark:bg-zinc-900 text-black dark:text-white',
    'hover:bg-gray-100 dark:hover:bg-zinc-800',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  );

  const activeClass = cn(
    'bg-amber-500 text-black shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]',
    'hover:bg-amber-400',
  );

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        className={buttonClass}
        onClick={() => onChange?.(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className='w-5 h-5' />
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          className={cn(buttonClass, currentPage === page && activeClass)}
          onClick={() => onChange?.(page)}
        >
          {page}
        </button>
      ))}

      <button
        className={buttonClass}
        onClick={() => onChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  );
};

export { Pagination };
