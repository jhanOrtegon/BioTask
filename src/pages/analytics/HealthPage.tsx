import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays, addDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { useStoriesStore } from "@/features/stories/store";
import { useSprintsStore } from "@/features/sprints/store";
import {
  BrainCircuit,
  ShieldAlert,
  Target,
  ArrowRightCircle,
} from "lucide-react";

import { HealthHeader } from "./components/HealthHeader";
import { HealthMetrics } from "./components/HealthMetrics";
import { HealthForecast } from "./components/HealthForecast";
import { HealthAlerts } from "./components/HealthAlerts";

export function HealthPage() {
  const navigate = useNavigate();
  const { stories } = useStoriesStore();
  const { sprints } = useSprintsStore();

  const activeSprint = useMemo(
    () => sprints.find((s) => s.status === "active"),
    [sprints],
  );

  const sprintStories = useMemo(() => {
    if (!activeSprint) return [];
    return stories.filter((s) => activeSprint.storyIds.includes(s.id));
  }, [stories, activeSprint]);

  const sprintTasks = useMemo(
    () =>
      sprintStories.flatMap((s) =>
        s.tasks.filter((t) => t.status !== "archived"),
      ),
    [sprintStories],
  );

  const healthMetrics = useMemo(() => {
    const total = sprintTasks.length;
    if (total === 0)
      return { completion: 0, pending: 0, blocked: 0, health: "good", risk: 0 };

    const completed = sprintTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const blocked = sprintTasks.filter((t) => t.status === "blocked").length;
    const completion = Math.round((completed / total) * 100);

    let health: "good" | "warning" | "critical" = "good";
    if (blocked > total * 0.2 || completion < 20) health = "critical";
    else if (blocked > 0 || completion < 50) health = "warning";

    return {
      completion,
      pending: total - completed,
      blocked,
      health,
      risk: Math.min(100, blocked * 10 + (100 - completion) / 2),
    };
  }, [sprintTasks]);

  const forecastData = useMemo(() => {
    // Real velocity: tasks completed per day based on timeLogs in the active sprint
    const today = startOfDay(new Date());
    const sprintStart = activeSprint
      ? startOfDay(new Date(activeSprint.startDate))
      : today;
    const daysSinceStart = Math.max(
      1,
      differenceInDays(today, sprintStart) + 1,
    );

    const totalTasks = sprintTasks.length;
    const completedTasks = sprintTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const tasksPerDay = completedTasks / daysSinceStart;

    // Daily hours logged — derive from timeLogs of members in sprint
    const dailyLoggedSeconds: Record<string, number> = {};
    sprintStories.forEach((story) => {
      story.tasks.forEach((task) => {
        (task.timeLogs || []).forEach((log) => {
          if (!log.startedAt || !log.endedAt) return;
          const dayKey = format(new Date(log.startedAt), "yyyy-MM-dd");
          const elapsed =
            (new Date(log.endedAt).getTime() -
              new Date(log.startedAt).getTime()) /
            1000;
          dailyLoggedSeconds[dayKey] =
            (dailyLoggedSeconds[dayKey] || 0) + elapsed;
        });
      });
    });

    // Average hours per day based on last 3 days
    const last3Days = Array.from({ length: 3 }, (_, i) => {
      const d = addDays(today, -(2 - i));
      return format(d, "yyyy-MM-dd");
    });
    const avgSecondsPerDay =
      last3Days.reduce((acc, d) => acc + (dailyLoggedSeconds[d] || 0), 0) / 3;
    const avgHoursPerDay = Math.round(avgSecondsPerDay / 3600);

    // Estimate remaining stories/tasks
    return [0, 1, 2].map((i) => {
      const date = addDays(today, i + 1);
      const projectedCompleted = Math.min(
        totalTasks,
        completedTasks + Math.round(tasksPerDay * (i + 1)),
      );
      return {
        date,
        dayName: format(date, "EEEE", { locale: es }),
        dayNum: format(date, "dd"),
        hours: avgHoursPerDay || Math.round(avgSecondsPerDay / 3600) || 6,
        stories: Math.max(
          0,
          projectedCompleted -
            completedTasks -
            (i > 0 ? Math.round(tasksPerDay * i) : 0),
        ),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintTasks, sprintStories, activeSprint]);

  const daysRemaining = activeSprint
    ? differenceInDays(new Date(activeSprint.endDate), new Date())
    : 0;

  const scrumActions = useMemo(() => {
    const blockedTasks = sprintTasks.filter((t) => t.status === "blocked");
    const blockedOver48h = blockedTasks.filter(
      (t) => differenceInDays(new Date(), new Date(t.updatedAt)) >= 2,
    ).length;

    const completed = sprintTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const remaining = Math.max(0, sprintTasks.length - completed);

    const velocityFromForecast =
      forecastData.reduce((acc, d) => acc + d.stories, 0) /
      (forecastData.length || 1);
    const projectedCapacity = Math.max(
      1,
      Math.round(velocityFromForecast * Math.max(1, daysRemaining)),
    );
    const carryOverRisk = remaining > projectedCapacity;
    const dailyCloseTarget = Math.max(
      1,
      Math.ceil(remaining / Math.max(1, daysRemaining)),
    );

    return {
      blockedOver48h,
      carryOverRisk,
      dailyCloseTarget,
      remaining,
    };
  }, [daysRemaining, forecastData, sprintTasks]);

  if (!activeSprint) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-background">
        <Card className="max-w-md w-full border-dashed border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <BrainCircuit className="h-12 w-12 text-primary/40 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold italic">
                No hay Sprint Activo
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Activa un sprint en el Lab para visualizar la telemetría de
                salud.
              </p>
            </div>
            <Button
              onClick={() => {
                void navigate("/sprints");
              }}
              className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20"
            >
              Ir al Lab de Sprints
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative transition-all duration-500">
      <div className="max-w-[1400px] mx-auto w-full space-y-8 animate-in fade-in duration-700 pb-20">
        <HealthHeader
          daysRemaining={daysRemaining}
          health={healthMetrics.health as "good" | "warning" | "critical"}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HealthMetrics metrics={healthMetrics} />
          <HealthForecast data={forecastData} />
        </div>

        <HealthAlerts blocked={healthMetrics.blocked} />

        <Card className="border-primary/15 bg-card/70 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  Decisiones Scrum al grano
                </h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  void navigate("/board");
                }}
              >
                Ir al tablero <ArrowRightCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/60 p-4 bg-background/60">
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Objetivo diario de cierre
                </p>
                <p className="text-2xl font-bold tabular-nums mt-1">
                  {scrumActions.dailyCloseTarget}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tareas/día para evitar arrastre al próximo sprint.
                </p>
              </div>

              <div className="rounded-lg border border-amber-500/25 p-4 bg-amber-500/5">
                <div className="flex items-center gap-2 text-amber-600">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-[11px] font-semibold">
                    Bloqueos envejecidos
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums mt-1">
                  {scrumActions.blockedOver48h}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Con más de 48h; prioridad 1 para el Scrum Master.
                </p>
              </div>

              <div
                className={`rounded-lg border p-4 ${scrumActions.carryOverRisk ? "border-destructive/30 bg-destructive/5" : "border-emerald-500/25 bg-emerald-500/5"}`}
              >
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Riesgo de carry-over
                </p>
                <p className="text-sm font-bold mt-2">
                  {scrumActions.carryOverRisk
                    ? "ALTO: ajustar alcance hoy"
                    : "CONTROLADO: sprint encaminado"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pendientes: {scrumActions.remaining}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="fixed -bottom-48 -left-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
      <div className="fixed -top-48 -right-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
    </div>
  );
}
