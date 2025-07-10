import * as React from "react"
import { Dialog as HeadlessDialog } from "@headlessui/react"

import { cn } from "@/lib/utils"

const Dialog = HeadlessDialog

const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof HeadlessDialog.Panel>>(
  ({ className, children, ...props }, ref) => (
    <>
      {/* Overlay/Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" aria-hidden="true" />
      
      {/* Dialog Panel Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <HeadlessDialog.Panel
          ref={ref}
          className={cn(
            "relative grid gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
            className
          )}
          {...props}
        >
          {children}
        </HeadlessDialog.Panel>
      </div>
    </>
  )
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof HeadlessDialog.Title>>(
  ({ className, ...props }, ref) => (
    <HeadlessDialog.Title
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof HeadlessDialog.Description>>(
  ({ className, ...props }, ref) => (
    <HeadlessDialog.Description
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
DialogDescription.displayName = "DialogDescription"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }
