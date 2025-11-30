import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }
>(({ className, defaultValue, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue)

    return (
        <div
            ref={ref}
            className={cn("", className)}
            data-value={value}
            {...props}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as any, { value, onValueChange: setValue })
                }
                return child
            })}
        </div>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; onValueChange?: (value: string) => void }
>(({ className, value, onValueChange, ...props }, ref) => {
    // We need to access the parent's value state. 
    // In a real implementation we'd use Context, but for simplicity we'll rely on the parent passing props
    // However, the parent Tabs component clones children, but TabsTrigger is inside TabsList.
    // This simple implementation won't work if nested.
    // Let's use a simple Context.

    const context = React.useContext(TabsContext)
    const isActive = context.value === value

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive && "bg-background text-foreground shadow-sm",
                className
            )}
            onClick={() => context.onValueChange(value)}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (context.value !== value) return null

    return (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        />
    )
})
TabsContent.displayName = "TabsContent"

// Context for Tabs
const TabsContext = React.createContext<{
    value?: string
    onValueChange: (value: string) => void
}>({
    onValueChange: () => { }
})

// Wrapper to provide context
const TabsRoot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }
>(({ defaultValue, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue)

    return (
        <TabsContext.Provider value={{ value, onValueChange: setValue }}>
            <div ref={ref} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
})
TabsRoot.displayName = "Tabs"

export { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent }
