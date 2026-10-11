import React, { ButtonHTMLAttributes } from "react";
import { Loader2Icon, BoxIcon } from "lucide-react";
import { buttonClasses, ButtonSize, ButtonVariant } from "./buttonStyles";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: BoxIcon;
  loading?: boolean;
}
export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2Icon className={`${iconClass} animate-spin`} aria-hidden /> : Icon ? <Icon className={iconClass} aria-hidden /> : null}
      {children}
    </button>;
}