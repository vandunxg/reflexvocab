import { Children, isValidElement, type ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Icon } from './Icon';

type OptionProps = { value: string | number; children: ReactNode; lang?: string };

export function Select({ children, value, onValueChange, className, id, disabled, ...aria }: {
  children: ReactNode;
  value: string | number;
  onValueChange: (value: string) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}) {
  // Radix reserves the empty string for its placeholder, while our filters use it as a real value.
  const encode = (item: string | number) => `v${item}`;
  const options = Children.toArray(children).filter(isValidElement<OptionProps>);
  return (
    <SelectPrimitive.Root value={encode(value)} onValueChange={(item) => onValueChange(item.slice(1))} disabled={disabled}>
      <SelectPrimitive.Trigger id={id} className={`select-trigger ${className ?? ''}`} {...aria}>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon><Icon name="chevronDown" size={18} /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="select-menu" position="popper" sideOffset={6}>
          <SelectPrimitive.Viewport className="select-viewport">
            {options.map((option) => (
              <SelectPrimitive.Item key={encode(option.props.value)} value={encode(option.props.value)} className="select-option" lang={option.props.lang}>
                <SelectPrimitive.ItemText>{option.props.children}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator><Icon name="check" size={16} /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
