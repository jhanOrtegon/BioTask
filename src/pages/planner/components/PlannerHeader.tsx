import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Badge } from '@/shared/components/badge'
import { Zap, Search, Layers, CalendarDays } from "lucide-react";
import { Input } from "@/shared/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import type { Epic } from "@/features/epics/types";
import type { Sprint } from "@/features/sprints/types";

interface PlannerHeaderProps {
  isReadOnly: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  epics: Epic[];
  selectedEpicId: string;
  onEpicChange: (v: string) => void;
  sprints?: Sprint[];
  selectedSprintId?: string;
  onSprintChange?: (v: string) => void;
}

export function PlannerHeader({
  isReadOnly,
  searchQuery,
  setSearchQuery,
  epics,
  selectedEpicId,
  onEpicChange,
  sprints = [],
  selectedSprintId = "",
  onSprintChange,
}: PlannerHeaderProps) {
  return (
    <div className="flex flex-col gap-6 shrink-0 pb-6 border-b border-border/70">
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Planificación" },
              { label: "Power Planner v5.0" },
            ]}
          />
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lining-nums">
              Sprint <span className="text-primary">Pulse</span> Monitor
            </h1>
            <div className="flex items-center gap-2">
              {isReadOnly && (
                <Badge
                  variant="outline"
                  className="bg-muted border-none text-muted-foreground font-semibold px-2 py-0 text-xs "
                >
                  Solo Lectura
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-primary/5 border-primary/20 text-primary font-semibold px-2 py-0 text-xs "
              >
                <Zap className="h-2.5 w-2.5 mr-1 fill-primary opacity-50" />{" "}
                Live Planning
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-xl border border-primary/5 shadow-inner flex-wrap">
          {sprints.length > 0 && onSprintChange && (
            <Select
              value={selectedSprintId || "auto"}
              onValueChange={(v) => {
                onSprintChange(v === "auto" ? "" : v);
              }}
            >
              <SelectTrigger className="h-9 w-[200px] bg-background border-none shadow-sm rounded-lg text-xs font-medium">
                <CalendarDays className="h-3.5 w-3.5 mr-2 text-primary opacity-50" />
                <SelectValue placeholder="Sprint" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem
                  value="auto"
                  className="text-xs font-medium text-primary/60"
                >
                  Sprint Activo (auto)
                </SelectItem>
                {sprints.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="text-xs font-bold"
                  >
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={selectedEpicId} onValueChange={onEpicChange}>
            <SelectTrigger className="h-9 w-[180px] bg-background border-none shadow-sm rounded-lg text-xs font-medium">
              <Layers className="h-3.5 w-3.5 mr-2 text-primary opacity-50" />
              <SelectValue placeholder="Épica" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem
                value="all"
                className="text-xs font-medium text-primary/60"
              >
                Todas las Épicas
              </SelectItem>
              {epics.map((e) => (
                <SelectItem
                  key={e.id}
                  value={e.id}
                  className="text-xs font-bold uppercase"
                >
                  {e.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative group max-w-xl animate-in fade-in slide-in-from-left-4 duration-500">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Filtrar tareas dentro de las historias..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="w-full h-11 bg-card/30 border-border/50 rounded-xl pl-11 pr-4 text-sm font-bold focus:ring-primary/20 transition-all shadow-sm group-hover:bg-card/50"
        />
      </div>
    </div>
  );
}
