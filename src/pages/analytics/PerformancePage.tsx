import { useMemo, useState } from 'react'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { startOfDay, isSameDay, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/shared/components/button";
import type { DevPerformance } from "./types";

import { PerformanceHeader } from "./components/PerformanceHeader";
import { PerformancePodium } from "./components/PerformancePodium";
import { PerformanceTable } from "./components/PerformanceTable";

export function PerformancePage() {
  const { stories } = useStoriesStore();
  const { members } = useTeamStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const devPerformance = useMemo(() => {
    const dayToFilter = startOfDay(selectedDate);
    const stats: Record<string, DevPerformance | undefined> = {};

    members.forEach((m) => {
      stats[m.id] = {
        id: m.id,
        name: m.name,
        specialty: m.specialty || "General",
        avatar: m.avatarUrl,
        totalHours: 0,
        todayHours: 0,
        completedTasks: 0,
        blockedTasks: 0,
        activeTasks: 0,
        efficiency: 0,
        insight: "Flujo Estable",
        status: "neutral",
      };
    });

    stories.forEach((story) => {
      story.tasks.forEach((task) => {
        if (!task.assignedTo) return;

        const dev = stats[task.assignedTo];
        if (!dev) return;

        dev.totalHours += (task.timeSpent || 0) / 3600;

        if (task.status === "completed") dev.completedTasks++;
        else if (task.status === "blocked") dev.blockedTasks++;
        else if (task.status !== "archived") dev.activeTasks++;

        task.timeLogs?.forEach((log) => {
          const logDate = new Date(log.startedAt);
          if (isSameDay(logDate, dayToFilter)) {
            const start = logDate.getTime();
            const end = log.endedAt
              ? new Date(log.endedAt).getTime()
              : new Date().getTime();
            dev.todayHours += (end - start) / (1000 * 3600);
          }
        });
      });
    });

    const result = (
      Object.values(stats).filter(Boolean) as DevPerformance[]
    ).map((d) => {
      const totalAssigned = d.completedTasks + d.activeTasks + d.blockedTasks;
      d.efficiency =
        totalAssigned > 0
          ? Math.round((d.completedTasks / totalAssigned) * 100)
          : 0;

      if (d.blockedTasks > 1) {
        d.insight = `Bloqueado en ${String(d.blockedTasks)} frentes técnicos.`;
        d.status = "danger";
      } else if (d.todayHours > 5) {
        d.insight = "Alta tracción. Superando media diaria.";
        d.status = "success";
      } else if (d.activeTasks > 4) {
        d.insight = "Sobrecarga de contexto (Multitasking).";
        d.status = "warning";
      } else if (d.completedTasks > 0 && d.efficiency > 70) {
        d.insight = "Cierre efectivo de objetivos.";
        d.status = "success";
      }

      return d;
    });

    return {
      all: result.sort((a, b) => b.todayHours - a.todayHours),
      top3: [...result]
        .filter((d) => d.totalHours > 0)
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 3),
    };
  }, [members, stories, selectedDate]);

  const totalPages = Math.ceil(devPerformance.all.length / ITEMS_PER_PAGE);
  const paginatedPerformance = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return devPerformance.all.slice(start, start + ITEMS_PER_PAGE);
  }, [devPerformance.all, currentPage]);

  const adjustDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const isToday = isSameDay(selectedDate, new Date());

  const performanceActions = useMemo(() => {
    const riskyFocus = devPerformance.all.filter(
      (d) => d.activeTasks >= 4 && d.completedTasks === 0,
    );
    const highBlockers = devPerformance.all.filter((d) => d.blockedTasks >= 2);
    const champion = devPerformance.top3[0];

    return {
      riskyFocus,
      highBlockers,
      champion,
    };
  }, [devPerformance.all, devPerformance.top3]);

  return (
    <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative transition-all duration-500">
      <div className="max-w-[1400px] mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <PerformanceHeader />

          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/40">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => {
                adjustDate(-1);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-3">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold min-w-[120px] text-center">
                {isToday ? "Hoy, " : ""}
                {format(selectedDate, "dd 'de' MMM", { locale: es })}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => {
                adjustDate(1);
              }}
              disabled={isToday}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <p className="text-[11px] font-semibold">
                Riesgo de multitasking
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {performanceActions.riskyFocus.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Desarrolladores con foco disperso y sin cierres hoy.
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-[11px] font-semibold">Bloqueos recurrentes</p>
            </div>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {performanceActions.highBlockers.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Personas con 2+ bloqueos activos para escalar en daily.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Trophy className="h-4 w-4" />
              <p className="text-[11px] font-semibold">Momentum líder</p>
            </div>
            <p className="text-sm font-bold mt-2">
              {performanceActions.champion?.name || "Sin datos suficientes"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Úsalo como referencia para pairing o desbloqueo técnico.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <PerformancePodium top3={devPerformance.top3} />
          <div className="lg:col-span-2 max-h-[600px] flex flex-col">
            <PerformanceTable
              data={paginatedPerformance}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <div className="fixed -bottom-48 -left-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed -top-48 -right-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}

