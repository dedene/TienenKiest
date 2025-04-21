'use client';

import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForwardedRef } from '@/lib/use-forwarded-ref';
import { cn, DEFAULT_COLOR } from '@/lib/utils';
import { RotateCcwIcon } from 'lucide-react';
import { forwardRef, useMemo, useState, ReactNode } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  children?: ReactNode;
  defaultColor?: string;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    {
      disabled,
      value,
      onChange,
      onBlur,
      name,
      className,
      children,
      defaultColor = DEFAULT_COLOR,
      ...props
    },
    forwardedRef
  ) => {
    const ref = useForwardedRef(forwardedRef);
    const [open, setOpen] = useState(false);

    const parsedValue = useMemo(() => {
      return value || defaultColor;
    }, [value, defaultColor]);

    const handleReset = () => {
      onChange(defaultColor);
    };

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          {children ? (
            <div className={cn('cursor-pointer', className)} onClick={() => setOpen(true)}>
              {children}
            </div>
          ) : (
            <Button
              {...props}
              className={cn('block', className)}
              name={name}
              onClick={() => {
                setOpen(true);
              }}
              size="icon"
              style={{
                backgroundColor: parsedValue,
              }}
              variant="outline"
            >
              <div />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <HexColorPicker color={parsedValue} onChange={onChange} />
          <div className="mt-2 flex items-center gap-2 max-w-full">
            <Input
              className="shrink w-auto max-w-38"
              maxLength={7}
              onChange={(e) => {
                onChange(e?.currentTarget?.value);
              }}
              ref={ref}
              value={parsedValue}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0"
              onClick={handleReset}
              title="Reset kleur"
              type="button"
            >
              <RotateCcwIcon className="h-4 w-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
