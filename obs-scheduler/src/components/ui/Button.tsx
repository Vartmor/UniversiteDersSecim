import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-accent text-white hover:bg-blue-700 focus:ring-accent',
            secondary: 'bg-bg-secondary text-text-primary border border-border hover:bg-gray-100 focus:ring-gray-500',
            ghost: 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary focus:ring-gray-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        };

        const sizes = {
            sm: 'px-2.5 py-1.5 text-xs rounded',
            md: 'px-4 py-2 text-sm rounded-md',
            lg: 'px-6 py-3 text-base rounded-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
