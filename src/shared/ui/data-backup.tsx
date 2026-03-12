import { useRef } from 'react'
import { DownloadCloud, UploadCloud, Database } from 'lucide-react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { toast } from 'sonner'

const EXPORT_KEYS = [
  'auth-storage',
  'templates-storage',
  'stories-storage',
  'tasks-storage',
  'sprints-storage' // preparándonos para la nueva feature
]

export function DataBackup() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const exportData: Record<string, any> = {}
      for (const key of EXPORT_KEYS) {
        const item = localStorage.getItem(key)
        if (item) {
          const data = JSON.parse(item)
          
          // Auto-Sanitation for Stories and Tasks
          if (key === 'stories-storage' && data.state?.stories) {
            data.state.stories = data.state.stories.map((story: any) => ({
              ...story,
              tasks: story.tasks.map((task: any) => ({
                ...task,
                storyId: task.storyId || story.id // Ensure task has a storyId
              }))
            }))
          }
          
          exportData[key] = data
        }
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `taskcraft-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Respaldo exportado exitosamente', { description: 'Guarda este archivo en un lugar seguro.' })
    } catch (error) {
      console.error(error)
      toast.error('Error al exportar los datos')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        const parsedData = JSON.parse(result)

        // Basic validation
        let importedCount = 0
        for (const key of EXPORT_KEYS) {
          if (parsedData[key]) {
            localStorage.setItem(key, JSON.stringify(parsedData[key]))
            importedCount++
          }
        }

        if (importedCount === 0) {
          throw new Error('No se encontraron datos válidos en el archivo.')
        }

        toast.success('Datos importados exitosamente', { description: 'Recargando la aplicación para aplicar los cambios...' })
        
        // Reload page to reinitialize Zustand stores from localStorage
        setTimeout(() => {
          window.location.reload()
        }, 1500)

      } catch (error) {
        console.error(error)
        toast.error('Error importando el respaldo', { description: 'Asegúrate de que sea un archivo JSON exportado por Taskcraft validamente.' })
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    
    reader.readAsText(file)
  }

  return (
    <>
      <input 
        type="file" 
        accept="application/json" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full">
            <Database className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Respaldo de Datos</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Datos Locales</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
            <DownloadCloud className="mr-2 h-4 w-4" />
            <span>Exportar Respaldo (.json)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportClick} className="cursor-pointer text-amber-600 focus:text-amber-500">
            <UploadCloud className="mr-2 h-4 w-4" />
            <span>Importar Datos</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
