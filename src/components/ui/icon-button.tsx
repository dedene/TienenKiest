import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive-outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function IconButton({
  icon,
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('p-0 h-9 w-9 rounded-full', className)}
      {...props}
    >
      {icon}
    </Button>
  );
}
