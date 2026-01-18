import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Pixel RPG Table
 * Styles utilize thick solid borders and parchment colors to simulate an 8-bit quest board or shop menu.
 * Fonts: --font-heading (Jacquard 12) for headers, --font-body (Jersey 10) for content.
 */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div 
    className="relative w-full overflow-auto bg-[#f4dcb3] border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]"
    style={{ imageRendering: "pixelated" }}
  >
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-2xl border-collapse", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn("bg-[#5d4037] text-[#f4dcb3] border-b-[4px] border-black", className)} 
    style={{ fontFamily: "var(--font-heading)" }}
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 text-[#3e2723]", className)}
    style={{ fontFamily: "var(--font-body)" }}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t-[4px] border-black bg-[#d7ba8d] font-medium [&>tr]:last:border-b-0",
      className
    )}
    style={{ fontFamily: "var(--font-body)" }}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b-[4px] border-black/10 transition-none hover:bg-black/5 data-[state=selected]:bg-[#d7ba8d]",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-2 text-left text-s align-middle font-normal tracking-wide [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 leading-none", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xl text-[#3e2723]/70 italic", className)}
    style={{ fontFamily: "var(--font-body)" }}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}