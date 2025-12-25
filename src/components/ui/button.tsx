import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        const Comp = asChild ? 'span' : 'button'

        const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

        const variants = {
            default: "bg-zinc-900 text-white hover:bg-zinc-800",
            destructive: "bg-red-600 text-white hover:bg-red-700",
            outline: "border border-zinc-300 bg-white hover:bg-zinc-100",
            secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
            ghost: "hover:bg-zinc-100",
            link: "underline-offset-4 hover:underline text-zinc-900"
        }

        const sizes = {
            default: "h-10 py-2 px-4",
            sm: "h-9 px-3 rounded-md",
            lg: "h-11 px-8 rounded-md",
            icon: "h-10 w-10"
        }

        const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

        return (
            <Comp
                className={classes}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
