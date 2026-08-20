import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface KitchenOrder {
  id: number
  table_id: number
  status: "Pending" | "Cooking" | "Ready" | "Served"
  items: { name: string; quantity: number }[]
  created_at: string
}

export function OrderCard({ order, onStatusChange }: { order: KitchenOrder, onStatusChange: (id: number, status: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-red-100 text-red-800"
      case "Cooking": return "bg-yellow-100 text-yellow-800"
      case "Ready": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getNextStatus = (status: string) => {
    if (status === "Pending") return "Cooking"
    if (status === "Cooking") return "Ready"
    if (status === "Ready") return "Served"
    return null
  }
  
  const nextStatus = getNextStatus(order.status)

  return (
    <Card className="mb-4 shadow-sm border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Table {order.table_id}</CardTitle>
          <Badge className={getStatusColor(order.status)} variant="outline">
            {order.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">Order #{order.id} • {new Date(order.created_at).toLocaleTimeString()}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm font-medium">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {nextStatus && (
        <CardFooter>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => onStatusChange(order.id, nextStatus)}
          >
            Mark as {nextStatus}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
