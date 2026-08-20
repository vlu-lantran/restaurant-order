import { OrderCard, KitchenOrder } from "./OrderCard"
import { ScrollArea } from "@/components/ui/scroll-area"

export function OrderBoard({ orders, onStatusChange }: { orders: KitchenOrder[], onStatusChange: (id: number, status: string) => void }) {
  const columns = ["Pending", "Cooking", "Ready", "Served"]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
      {columns.map(col => (
        <div key={col} className="bg-gray-100 p-4 rounded-xl flex flex-col">
          <h2 className="font-bold text-lg mb-4 text-center border-b pb-2">{col}</h2>
          <ScrollArea className="flex-grow pr-3">
            {orders.filter(o => o.status === col).map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
            ))}
            {orders.filter(o => o.status === col).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No orders</p>
            )}
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}
