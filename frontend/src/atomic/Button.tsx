import { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils'

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'blue' | 'red' | 'green' | 'orange'
}

const defaultVariant = 'blue'

const variants: Record<NonNullable<MyButtonProps['variant']>, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    red: 'bg-red-500 hover:bg-red-600',
    green: 'bg-green-500 hover:bg-green-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
}

const Button = ({ variant, ...buttonProps }: MyButtonProps) => {
    return (
        <button
            {...buttonProps}
            className={cn(
                'text-white px-4 py-2 rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed hover:cursor-pointer',
                variants[variant ?? defaultVariant],
                buttonProps.className
            )}
        />
    )
}

export default Button
