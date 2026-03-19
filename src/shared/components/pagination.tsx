import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/shared/components/button"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"

export interface PaginationProps {
 currentPage: number
 totalPages: number
 onPageChange: (page: number) => void
 totalItems?: number
 itemsPerPage?: number
 onItemsPerPageChange?: (value: number) => void
 itemsPerPageOptions?: number[]
 showFirstLast?: boolean
 className?: string
}

export function Pagination({
 currentPage,
 totalPages,
 onPageChange,
 totalItems,
 itemsPerPage,
 onItemsPerPageChange,
 itemsPerPageOptions = [10, 15, 25, 50],
 showFirstLast = true,
 className
}: PaginationProps) {
 const pages = React.useMemo(() => {
 const items: (number | string)[] = []
 const windowSize = 2

 if (totalPages <= 7) {
 for (let i = 1; i <= totalPages; i++) items.push(i)
 } else {
 items.push(1)
 if (currentPage > windowSize + 2) items.push("ellipsis-start")

 const start = Math.max(2, currentPage - windowSize)
 const end = Math.min(totalPages - 1, currentPage + windowSize)

 for (let i = start; i <= end; i++) items.push(i)

 if (currentPage < totalPages - windowSize - 1) items.push("ellipsis-end")
 items.push(totalPages)
 }
 return items
 }, [currentPage, totalPages])

 if (totalPages <= 1 && !totalItems) return null

 const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null
 const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null

 return (
 <div className={cn("flex items-center justify-between gap-4 flex-wrap pt-2", className)}>
 {/* Left: info & per-page */}
 <div className="flex items-center gap-4">
 {totalItems != null && (
 <span className="text-[12px] font-medium text-muted-foreground/60 tabular-nums">
 {startItem && endItem
 ? <>{startItem}–{endItem} <span className="text-muted-foreground/30 font-light italic">de</span> {totalItems} resultados</>
 : <>{totalItems} resultados</>
 }
 </span>
 )}
 {onItemsPerPageChange && itemsPerPage != null && (
 <div className="flex items-center gap-2.5 ml-2 border-l border-border/20 pl-4 hidden sm:flex">
 <span className="text-xs font-bold text-muted-foreground/40">Mostrar:</span>
 <Select 
 value={String(itemsPerPage)} 
 onValueChange={(v) => { onItemsPerPageChange(Number(v)); }}
 >
 <SelectTrigger className="h-8 w-[70px] rounded-lg border-border/40 bg-background text-[11px] font-bold hover:bg-secondary/20 transition-all focus:ring-0 shadow-sm">
 <SelectValue placeholder={itemsPerPage} />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-border/40">
 {itemsPerPageOptions.map(opt => (
 <SelectItem key={opt} value={String(opt)} className="text-[11px] font-bold">
 {opt}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 {/* Right: page navigation */}
 {totalPages > 1 && (
 <nav
 role="navigation"
 aria-label="pagination"
 className="flex items-center gap-1"
 >
 {showFirstLast && (
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-all disabled:opacity-20"
 onClick={() => { onPageChange(1); }}
 disabled={currentPage === 1}
 >
 <ChevronsLeft className="h-4 w-4" />
 </Button>
 )}
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-all disabled:opacity-20"
 onClick={() => { onPageChange(Math.max(1, currentPage - 1)); }}
 disabled={currentPage === 1}
 >
 <ChevronLeft className="h-4 w-4" />
 </Button>

 <div className="flex items-center gap-1 mx-1">
 {pages.map((page, idx) => {
 if (typeof page === "string") {
 return (
 <span key={`ellipsis-${String(idx)}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground/20">
 <MoreHorizontal className="h-4 w-4" />
 </span>
 )
 }

 const isActive = page === currentPage
 return (
 <Button
 key={page}
 variant={isActive ? "default" : "ghost"}
 size="icon"
 className={cn(
 "h-8 w-8 rounded-lg text-xs font-bold transition-all duration-200",
 isActive
 ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 pointer-events-none"
 : "text-muted-foreground hover:text-primary hover:bg-primary/5"
 )}
 onClick={() => { onPageChange(page); }}
 >
 {page}
 </Button>
 )
 })}
 </div>

 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-all disabled:opacity-20"
 onClick={() => { onPageChange(Math.min(totalPages, currentPage + 1)); }}
 disabled={currentPage === totalPages}
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 {showFirstLast && (
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-all disabled:opacity-20"
 onClick={() => { onPageChange(totalPages); }}
 disabled={currentPage === totalPages}
 >
 <ChevronsRight className="h-4 w-4" />
 </Button>
 )}
 </nav>
 )}
 </div>
 )
}
