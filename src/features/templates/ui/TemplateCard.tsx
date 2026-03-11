import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import type { Template } from "../types"

interface TemplateCardProps {
  template: Template
  onSelect: (id: string) => void
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-colors hover:border-primary/50">
      <CardHeader>
        <CardTitle>{template.title}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={() => { onSelect(template.id) }} className="w-full">
          Usar Plantilla
        </Button>
      </CardFooter>
    </Card>
  )
}
