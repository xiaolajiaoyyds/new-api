import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../helpers/utils';

const avatarVariants = cva(
  'inline-flex items-center justify-center font-bold overflow-hidden bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-white dark:border-zinc-700 shadow-sm',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-14 h-14 text-xl',
        xl: 'w-20 h-20 text-3xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

const Avatar = React.forwardRef(({ className, size, shape, src, alt, fallback, color, children, ...props }, ref) => {
  const [imgError, setImgError] = React.useState(false);

  const showFallback = !src || imgError;
  const fallbackText = fallback || (alt ? alt.charAt(0).toUpperCase() : '?');

  return (
    <div
      className={cn(avatarVariants({ size, shape, className }))}
      ref={ref}
      style={color && showFallback ? { backgroundColor: color, color: '#fff' } : undefined}
      {...props}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="">{children || fallbackText}</span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };