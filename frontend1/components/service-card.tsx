import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  features: string[]
  colorClass: string
  stats?: {
    label: string
    value: string
  }
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  features,
  colorClass,
  stats,
}: ServiceCardProps) {
  return (
    <Card className="group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          colorClass
        )}
      />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
              colorClass
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          {stats && (
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.value}</p>
              <p className="text-xs text-muted-foreground">{stats.label}</p>
            </div>
          )}
        </div>
        <CardTitle className="text-xl mt-4">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <span className={cn("mr-2 h-1.5 w-1.5 rounded-full", colorClass)} />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full group/btn">
          <Link href={href}>
            <span>Explore {title}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
