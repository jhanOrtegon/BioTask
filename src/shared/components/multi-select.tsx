import React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder: string
  allLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  allLabel = 'Todos',
  icon,
  className,
}: MultiSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const displayLabel =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? (options.find(o => o.value === selected[0])?.label ?? placeholder)
        : `${String(selected.length)} seleccionados`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 bg-background border-border/40 rounded-lg text-xs font-medium hover:border-primary/30 transition-all justify-between gap-1.5 w-full md:w-[130px]',
            selected.length > 0 && 'border-primary/30 bg-primary/5 text-primary',
            className
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            {icon}
            <span className="truncate">{displayLabel}</span>
          </span>
          {selected.length > 0 ? (
            <Badge
              variant="secondary"
              className="h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full shrink-0"
            >
              {selected.length}
            </Badge>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-lg border-border/40">
        <DropdownMenuLabel className="text-[11px] text-muted-foreground font-medium py-1.5">
          {placeholder}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selected.length === 0}
          onCheckedChange={() => {
            onChange([])
          }}
          onSelect={(e) => {
            e.preventDefault()
          }}
          className="text-xs font-medium text-muted-foreground"
        >
          {allLabel}
        </DropdownMenuCheckboxItem>
        {options.map(opt => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={selected.includes(opt.value)}
            onCheckedChange={() => {
              toggle(opt.value)
            }}
            onSelect={(e) => {
              e.preventDefault()
            }}
            className="text-xs font-medium"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-1">
              <button
                onClick={() => {
                  onChange([])
                }}
                className="w-full text-[11px] text-muted-foreground hover:text-foreground text-center py-1 rounded transition-colors hover:bg-muted"
              >
                Limpiar selección
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
