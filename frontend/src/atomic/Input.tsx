import React, { useId } from 'react'
import { cn } from '../utils'

type InputProps = {
    id?: string
    label: string
    error?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>

const Input = ({ id: userId, label, type = 'text', error, disabled, className, ...props }: InputProps) => {
    const randomId = useId()
    const id = userId ?? randomId

    const baseInputClasses =
        'w-full appearance-none rounded-md border bg-white px-3 py-2 text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2'

    const stateClasses = disabled
        ? 'border-slate-200 bg-slate-100 cursor-not-allowed text-slate-500'
        : error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div className="mt-1">
                <input
                    id={id}
                    name={id}
                    type={type}
                    disabled={disabled}
                    className={cn(baseInputClasses, stateClasses)}
                    {...props}
                />
                {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
            </div>
        </div>
    )
}

export default Input
