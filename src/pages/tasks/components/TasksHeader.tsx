import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { MultiSelect } from "@/shared/components/multi-select";
import { Breadcrumbs } from "@/shared/components/breadcrumbs";
import { Badge } from "@/shared/components/badge";
import { CheckSquare, Search, Filter, Layers, Plus } from "lucide-react";
import { cn } from "@/shared/utils";
import type { Story } from "@/features/stories/types";
import type { Epic } from "@/features/epics/types";

interface TasksHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  epics: Epic[];
  selectedEpicIds: string[];
  onEpicChange: (v: string[]) => void;
  selectedStoryIds: string[];
  onStoryChange: (v: string[]) => void;
  selectedStatuses: string[];
  onStatusChange: (v: string[]) => void;
  activeStories: Story[];
  showArchived: boolean;
  onToggleArchived: () => void;
  totalItems: number;
  onCreateTask: () => void;
}

export function TasksHeader({
  search,
  onSearchChange,
  epics,
  selectedEpicIds,
  onEpicChange,
  selectedStoryIds,
  onStoryChange,
  selectedStatuses,
  onStatusChange,
  activeStories,
  showArchived,
  onToggleArchived,
  totalItems,
  onCreateTask,
}: TasksHeaderProps) {
  return (
    <div className="flex flex-col gap-5 shrink-0 pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[{ label: "Ejecución" }, { label: "Gestión de Tareas" }]}
          />
          <div className="flex items-center gap-2.5 pt-0.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Gestión de <span className="text-primary">Tareas</span>
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/5 border-primary/15 text-primary font-medium px-2 py-0.5 text-xs h-5"
            >
              {totalItems} registros
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-lg transition-all",
              showArchived
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "text-muted-foreground hover:bg-muted",
            )}
            onClick={onToggleArchived}
          >
            {showArchived ? "Ocultar Archivadas" : "Ver Archivadas"}
          </Button>

          <Button size="sm" onClick={onCreateTask} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Nueva Tarea
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por título, código o contenido..."
            className="w-full h-9 bg-background border-border/40 rounded-lg pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <MultiSelect
            options={epics.map((e) => ({
              value: e.id,
              label: e.code || e.title,
            }))}
            selected={selectedEpicIds}
            onChange={onEpicChange}
            placeholder="Filtrar por Épica"
            allLabel="Todas las Épicas"
            icon={
              <Layers className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            }
          />

          <MultiSelect
            options={activeStories.map((s) => ({
              value: s.id,
              label: s.code || s.title,
            }))}
            selected={selectedStoryIds}
            onChange={onStoryChange}
            placeholder="Filtrar por Historia"
            allLabel="Todas las Historias"
            icon={
              <Filter className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            }
          />

          <MultiSelect
            options={[
              { value: "pending", label: "Por Hacer" },
              { value: "in_progress", label: "En Progreso" },
              { value: "qa", label: "Revisión / QA" },
              { value: "blocked", label: "Bloqueada" },
              { value: "completed", label: "Completada" },
            ]}
            selected={selectedStatuses}
            onChange={onStatusChange}
            placeholder="Filtrar por Estado"
            allLabel="Todos los Estados"
            icon={
              <CheckSquare className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            }
          />
        </div>
      </div>
    </div>
  );
}
