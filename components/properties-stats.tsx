import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Home, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Properties",
    value: "127",
    change: "+12%",
    icon: Building2,
  },
  {
    title: "Active Listings",
    value: "89",
    change: "+4%",
    icon: Home,
  },
  {
    title: "Total Value",
    value: "Ft 2.4B",
    change: "+18%",
    icon: DollarSign,
  },
  {
    title: "Avg. Price",
    value: "Ft 18.9M",
    change: "+6%",
    icon: TrendingUp,
  },
]

export function PropertiesStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600">{stat.change}</span> from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
