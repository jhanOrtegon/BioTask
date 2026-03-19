import { Button } from "@/shared/components/button"
import { DynamicTaskEditor } from "@/features/tasks/components/DynamicTaskEditor"
import { JiraPreview } from "@/features/tasks/components/JiraPreview"

interface PreviewSidePanelProps {
 tab: 'jira' | 'visual'
 setTab: (tab: 'jira' | 'visual') => void
}

export function PreviewSidePanel({ tab, setTab }: PreviewSidePanelProps) {
 return (
 <div className="bg-card/30 min-h-0 overflow-y-auto border-l">
 <div className="p-8 max-w-4xl mx-auto">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
 Previsualización
 </h3>
 <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
 <Button
 variant={tab === 'visual' ? 'secondary' : 'ghost'}
 size="sm"
 className="h-7 text-xs font-bold px-3"
 onClick={() => { setTab('visual') }}
 >
 Visual
 </Button>
 <Button
 variant={tab === 'jira' ? 'secondary' : 'ghost'}
 size="sm"
 className="h-7 text-xs font-bold px-3"
 onClick={() => { setTab('jira') }}
 >
 Jira
 </Button>
 </div>
 </div>

 {tab === 'visual' ? <DynamicTaskEditor readOnly /> : <JiraPreview />}
 </div>
 </div>
 )
}
