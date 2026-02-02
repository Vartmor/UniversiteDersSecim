import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, id, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full px-3 py-2 text-sm border rounded-md appearance-none',
                        'bg-white text-text-primary',
                        'border-border focus:border-accent focus:ring-1 focus:ring-accent',
                        'transition-colors focus:outline-none cursor-pointer',
                        'disabled:bg-gray-50 disabled:cursor-not-allowed',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
