import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/shared/ui/button"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
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

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center gap-1.5", className)}
    >
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all hidden sm:flex"
            onClick={() => { onPageChange(1) }}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          onClick={() => { onPageChange(Math.max(1, currentPage - 1)) }}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        {pages.map((page, idx) => {
          if (typeof page === "string") {
            return (
              <span key={`ellipsis-${String(idx)}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground/50">
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
                "h-9 w-9 rounded-xl text-xs font-black transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}
              onClick={() => { onPageChange(page) }}
            >
              {page}
            </Button>
          )
        })}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          onClick={() => { onPageChange(Math.min(totalPages, currentPage + 1)) }}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all hidden sm:flex"
            onClick={() => { onPageChange(totalPages) }}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  )
}
