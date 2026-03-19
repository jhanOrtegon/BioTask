import React from 'react'
import { Textarea } from './textarea'
import { Button } from './button'
import { Braces, Copy, Check } from 'lucide-react'
import { cn } from '@/shared/utils'

interface JsonTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
 onPrettify?: (value: string) => void
}

export function JsonTextarea({ className, value, onChange, onPrettify, ...props }: JsonTextareaProps) {
 const [copied, setCopied] = React.useState(false)

 const handleCopy = async () => {
 if (typeof value === 'string') {
 await navigator.clipboard.writeText(value)
 setCopied(true)
 setTimeout(() => { setCopied(false) }, 2000)
 }
 }
 const handlePrettify = () => {
 try {
 if (typeof value === 'string') {
 const obj = JSON.parse(value) as Record<string, unknown>
 const pretty = JSON.stringify(obj, null, 2)
 if (onPrettify) {
 onPrettify(pretty)
 }
 }
 } catch {
 // Not valid JSON, do nothing
 }
 }

 return (
 <div className="relative group/json">
 <div className="absolute top-3 right-3 flex gap-2 z-10">
 <Button 
 type="button"
 variant="secondary" 
 size="sm" 
 onClick={() => { void handleCopy(); }}
 className="h-7 rounded-lg bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-medium px-3"
 >
 {copied ? <Check className="h-3 w-3 mr-2 text-emerald-500" /> : <Copy className="h-3 w-3 mr-2" />}
 {copied ? 'Copiado' : 'Copiar'}
 </Button>
 <Button 
 type="button"
 variant="secondary" 
 size="sm" 
 onClick={handlePrettify}
 className="h-7 rounded-lg bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-primary transition-all text-xs font-medium px-3"
 >
 <Braces className="h-3 w-3 mr-2" />
 Formatear
 </Button>
 </div>
 
 <div className="flex bg-slate-950 rounded-xl border border-slate-800 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden shadow-inner">
 {/* Line numbers decoration */}
 <div className="w-10 bg-slate-900/50 border-r border-slate-800/50 flex flex-col pt-4 items-center gap-[18px] text-xs font-mono text-slate-600 select-none">
 {Array.from({ length: 10 }).map((_, i) => (
 <span key={i}>{i + 1}</span>
 ))}
 </div>
 
 <Textarea 
 {...props}
 value={value}
 onChange={onChange}
 className={cn(
 "border-none bg-transparent font-mono text-[11px] leading-relaxed p-4 text-emerald-400 placeholder:text-slate-700 focus-visible:ring-0 shadow-none resize-y min-h-[120px] custom-scrollbar",
 className
 )}
 />
 </div>
 
 <div className="mt-1 flex justify-between px-2">
 <span className="text-xs font-medium text-slate-500">JSON Editor Mode</span>
 {typeof value === 'string' && value.length > 0 && (
 <span className={cn(
 "text-xs font-bold ",
 (() => {
 try { JSON.parse(value); return "text-emerald-500" } catch { return "text-rose-500" }
 })()
 )}>
 {(() => {
 try { JSON.parse(value); return "Valid JSON" } catch { return "Invalid JSON Structure" }
 })()}
 </span>
 )}
 </div>
 </div>
 )
}
