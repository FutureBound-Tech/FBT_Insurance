import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onChange, min, max, step = 1, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
      <div className={cn("relative w-full", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none rounded-full bg-muted cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            background: `linear-gradient(to right, var(--primary) ${percentage}%, var(--muted) ${percentage}%)`,
          }}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
