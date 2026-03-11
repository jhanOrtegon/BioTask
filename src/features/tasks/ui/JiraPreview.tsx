import { useTasksStore } from '../store'
import { Button } from '@/shared/ui/button'
import { Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export function JiraPreview() {
  const currentTask = useTasksStore((state) => state.currentTask)
  const [copied, setCopied] = useState(false)

  if (!currentTask) return null

  const handleCopy = () => {
    void navigator.clipboard.writeText(currentTask.jiraContent || '').then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false) }, 2000)
    }).catch((err: unknown) => {
      console.error('Failed to copy text: ', err)
    })
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-xl border p-4 lg:p-6 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-primary">Formato Jira</h3>
        <Button 
          onClick={handleCopy} 
          variant={copied ? 'default' : 'secondary'} 
          className="transition-all duration-300"
          disabled={!currentTask.jiraContent}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copiar al portapapeles
            </>
          )}
        </Button>
      </div>
      
      <div className="flex-grow overflow-auto relative rounded-md bg-background border border-border/50 p-4 text-sm font-mono whitespace-pre-wrap text-muted-foreground shadow-sm">
        {currentTask.jiraContent || 'El texto convertido a Jira aparecerá aquí.'}
      </div>
    </div>
  )
}
