import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Custom styled number input spinners
        "[&::-webkit-outer-spin-button]:h-full [&::-webkit-outer-spin-button]:cursor-pointer",
        "[&::-webkit-inner-spin-button]:h-full [&::-webkit-inner-spin-button]:cursor-pointer",
        "[&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100",
        "[&::-webkit-outer-spin-button]:bg-stone-800/50 [&::-webkit-inner-spin-button]:bg-stone-800/50",
        "[&::-webkit-outer-spin-button]:hover:bg-stone-700 [&::-webkit-inner-spin-button]:hover:bg-stone-700",
        "[&::-webkit-outer-spin-button]:active:bg-red-900/30 [&::-webkit-inner-spin-button]:active:bg-red-900/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
