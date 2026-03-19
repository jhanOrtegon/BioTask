import React from 'react'
import { cn } from '@/shared/utils'
import { Button } from './button'
import { Copy, Check } from 'lucide-react'

interface JsonCodeBlockProps {
 code: string
 className?: string
}

export function JsonCodeBlock({ code, className }: JsonCodeBlockProps) {
 const [copied, setCopied] = React.useState(false)

 const handleCopy = async () => {
 await navigator.clipboard.writeText(code)
 setCopied(true)
 setTimeout(() => { setCopied(false) }, 2000)
 }
 // Simple JSON syntax highlighter
 const highlightJson = (jsonStr: string) => {
 try {
 // Try to parse and stringify to ensure it's valid/formatted
 const obj = JSON.parse(jsonStr) as Record<string, unknown>
 const formatted = JSON.stringify(obj, null, 2)
 
 return formatted.replace(
 /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
 (match) => {
 let cls = 'text-amber-500' // number
 if (/^"/.test(match)) {
 if (/:$/.test(match)) {
 cls = 'text-blue-400' // key
 } else {
 cls = 'text-emerald-400' // string
 }
 } else if (/true|false/.test(match)) {
 cls = 'text-purple-400' // boolean
 } else if (/null/.test(match)) {
 cls = 'text-rose-400' // null
 }
 return `<span class="${cls}">${match}</span>`
 }
 )
 } catch {
 // If not valid JSON, just return escaped text
 return jsonStr.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m))
 }
 }

 const highlighted = React.useMemo(() => highlightJson(code), [code])

 return (
 <div className="relative group/code">
 <Button 
 onClick={() => { void handleCopy(); }}
 size="icon"
 variant="ghost"
 className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 opacity-0 group-hover/code:opacity-100 transition-all z-10"
 >
 {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
 </Button>
 <pre 
 className={cn(
 "font-mono text-[11px] leading-relaxed p-4 rounded-xl bg-slate-950 text-slate-300 overflow-x-auto border border-slate-800",
 className
 )}
 dangerouslySetInnerHTML={{ __html: highlighted }}
 />
 </div>
 )
}
