import { useDynamicEditorLogic } from "./dynamic-editor/hooks/useDynamicEditorLogic"
import { EditorHeader } from "./dynamic-editor/components/EditorHeader"
import { ServicesSection } from "./dynamic-editor/components/ServicesSection"
import { SectionHeader, ListSection, ChecklistSection } from "./dynamic-editor/components/SharedComponents"
import { CommitDialog } from "./dynamic-editor/components/CommitDialog"
import { Breadcrumbs } from "@/shared/components/breadcrumbs"
import { Textarea } from "@/shared/components/textarea"
import { Hash } from "lucide-react"
import type { TaskDraft } from "../types"
import { generateConventionalCommit } from "../utils"
import type { Story } from "@/features/stories/types"

interface DynamicTaskEditorProps {
 readOnly?: boolean
 task?: TaskDraft
 onUpdate?: (updates: Partial<TaskDraft>) => void
}

export function DynamicTaskEditor({ readOnly = false, task, onUpdate }: DynamicTaskEditorProps) {
 const {
 currentTask,
 template,
 templates,
 stories,
 members,
 showCommitDialog, setShowCommitDialog,
 commitLang, setCommitLang,
 copied,
 handleCopyCommit,
 handleCopyJira,
 handleApplyTemplate,
 handleApplyStory,
 handleAddService,
 handleUpdateService,
 handleRemoveService,
 handleAddListItem,
 handleUpdateListItem,
 handleRemoveListItem,
 handleAddChecklist,
 handleUpdateChecklist,
 handleRemoveChecklist,
 handleFillExample,
 updateTaskInfo,
 updateTaskData
 } = useDynamicEditorLogic(task, onUpdate)

 if (!currentTask) return null

 // Fields toggles based on template
 const hasObjective = template ? template.hasObjective : true
 const hasServices = template ? template.hasServices : true
 const hasFunctionalRequirements = template ? template.hasFunctionalRequirements : true
 const hasValidations = template ? template.hasValidations : true

 const currentStory = currentTask.storyId ? stories.find((s: Story) => s.id === currentTask.storyId) : undefined

 return (
 <div className="space-y-4 animate-in fade-in duration-300">
 <Breadcrumbs items={[
 { label: 'Tablero Ágil', href: '/' },
 ...(currentStory ? [{ label: currentStory.code, href: `/stories/${currentStory.id}` }] : []),
 { label: currentTask.title || 'Nueva Tarea' }
 ]} />

 <EditorHeader 
 currentTask={currentTask}
 readOnly={readOnly}
 templates={templates}
 stories={stories}
 members={members}
 onApplyTemplate={handleApplyTemplate}
 onApplyStory={handleApplyStory}
 onUpdateInfo={updateTaskInfo}
 onShowCommit={() => { setShowCommitDialog(true) }}
 onFillExample={handleFillExample}
 onCopyJira={handleCopyJira}
 />

 {hasObjective && (
 <div className="border-x border-[0px] border-b border-border bg-card">
 <div className="p-5 pt-4">
 <SectionHeader 
 number="01" 
 icon={Hash} 
 title="Objetivo" 
 color="text-primary" 
 isRequired={template?.requiredObjective}
 />
 <div className="mt-4">
 <Textarea 
 disabled={readOnly}
 placeholder="Describe el objetivo principal..."
 value={currentTask.data.objective}
 onChange={e => { updateTaskData({ objective: e.target.value }) }}
 className="min-h-[120px] text-sm leading-relaxed bg-background resize-none"
 />
 </div>
 </div>
 </div>
 )}

 <ChecklistSection 
 items={currentTask.checklists || []}
 readOnly={readOnly}
 onAdd={handleAddChecklist}
 onUpdate={handleUpdateChecklist}
 onRemove={handleRemoveChecklist}
 />

 {hasServices && (
 <ServicesSection 
 services={currentTask.data.services}
 readOnly={readOnly}
 onAdd={handleAddService}
 onUpdate={handleUpdateService}
 onRemove={handleRemoveService}
 isRequired={template?.requiredServices}
 />
 )}

 <div className="rounded-b-xl border border-border bg-card overflow-hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
 {hasFunctionalRequirements && (
 <ListSection 
 number="04"
 title="Requerimientos"
 color="text-emerald-500"
 items={currentTask.data.requirements}
 readOnly={readOnly}
 onAdd={() => { handleAddListItem('requirements') }}
 onUpdate={(i, v) => { handleUpdateListItem('requirements', i, v) }}
 onRemove={(i) => { handleRemoveListItem('requirements', i) }}
 isRequired={template?.requiredRequirements}
 />
 )}

 {hasValidations && (
 <ListSection 
 number="05"
 title="Validaciones"
 color="text-amber-500"
 items={currentTask.data.validations}
 readOnly={readOnly}
 onAdd={() => { handleAddListItem('validations') }}
 onUpdate={(i, v) => { handleUpdateListItem('validations', i, v) }}
 onRemove={(i) => { handleRemoveListItem('validations', i) }}
 isRequired={template?.requiredValidations}
 />
 )}
 </div>
 </div>

 <CommitDialog 
 open={showCommitDialog}
 onOpenChange={setShowCommitDialog}
 commit={generateConventionalCommit(currentTask, commitLang)}
 lang={commitLang}
 onLangChange={setCommitLang}
 copied={copied}
 onCopy={handleCopyCommit}
 />
 </div>
 )
}
