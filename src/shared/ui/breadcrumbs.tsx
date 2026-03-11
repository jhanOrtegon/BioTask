import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-[13px] font-bold text-muted-foreground/60 w-full overflow-hidden">
      <Link to="/" className="flex items-center hover:text-foreground transition-colors shrink-0">
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center overflow-hidden">
          <ChevronRight className="h-4 w-4 mx-1.5 opacity-40 shrink-0" />
          {item.href ? (
            <Link to={item.href} className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[250px]">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground truncate max-w-[150px] sm:max-w-[300px]" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
