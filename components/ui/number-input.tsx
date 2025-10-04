'use client'

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberInputProps extends Omit<React.ComponentProps<"input">, 'type'> {
  value?: number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min, max, ...props }, ref) => {
    const handleIncrement = () => {
      const currentValue = Number(value) || 0
      const newValue = max !== undefined ? Math.min(currentValue + 1, max) : currentValue + 1

      if (onChange) {
        const event = {
          target: { value: String(newValue) }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    const handleDecrement = () => {
      const currentValue = Number(value) || 0
      const newValue = min !== undefined ? Math.max(currentValue - 1, min) : currentValue - 1

      if (onChange) {
        const event = {
          target: { value: String(newValue) }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-8 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]",
            className
          )}
          {...props}
        />
        <div className="absolute right-0 top-0 h-full flex flex-col border-l border-stone-800">
          <button
            type="button"
            onClick={handleIncrement}
            className="flex-1 px-1.5 bg-stone-900/50 hover:bg-stone-800 active:bg-red-900/30 transition-colors rounded-tr-md border-b border-stone-800 group"
            tabIndex={-1}
          >
            <ChevronUp className="h-3 w-3 text-stone-500 group-hover:text-stone-300" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="flex-1 px-1.5 bg-stone-900/50 hover:bg-stone-800 active:bg-red-900/30 transition-colors rounded-br-md group"
            tabIndex={-1}
          >
            <ChevronDown className="h-3 w-3 text-stone-500 group-hover:text-stone-300" />
          </button>
        </div>
      </div>
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
