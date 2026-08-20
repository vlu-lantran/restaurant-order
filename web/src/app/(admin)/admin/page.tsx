"use client"
import { useState, useEffect, useCallback } from "react"
import { OrderBoard } from "@/components/domain/kitchen/OrderBoard"
import { TableBoard } from "@/components/domain/kitchen/TableBoard"
import { HistoryBoard } from "@/components/domain/kitchen/HistoryBoard"
import { KitchenOrder } from "@/components/domain/kitchen/OrderCard"
import { useWebSocket } from "@/hooks/useWebSocket"
import { API_URL, WS_URL } from "@/lib/config"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [activeTab, setActiveTab] = useState<"kitchen" | "tables" | "history">("kitchen")

  useEffect(() => {
    fetch(`${API_URL}/orders/active`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error)
  }, [])

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === "ORDER_CREATED") {
      setOrders(prev => [...prev, data.payload])
      toast.success(`New order from Table ${data.payload.table_id}!`)
    } else if (data.type === "ORDER_UPDATED") {
      setOrders(prev => prev.map(o => o.id === data.payload.id ? { ...o, status: data.payload.status } : o))
    } else if (data.type === "CALL_SERVER") {
      toast(`Table ${data.payload.table_id} needs assistance!`, { icon: '🔔' })
    } else if (data.type === "TABLE_CHECKOUT") {
      setOrders(prev => prev.filter(o => o.table_id !== data.payload.table_id))
      toast.success(`Table ${data.payload.table_id} checked out.`)
    }
  }, [])

  useWebSocket(`${WS_URL}/kitchen`, handleWebSocketMessage)

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o))
    
    // DB Update
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (e) {
      toast.error("Failed to update order status")
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
        <div className="bg-gray-100 p-1 rounded-xl flex space-x-1 shadow-inner">
          <button 
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === "kitchen" ? "bg-white text-black shadow-md" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("kitchen")}
          >
            Kitchen (KDS)
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === "tables" ? "bg-white text-black shadow-md" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("tables")}
          >
            Tables (FOH)
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === "history" ? "bg-white text-black shadow-md" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("history")}
          >
            History & Export
          </button>
        </div>
      </div>
      
      {activeTab === "kitchen" && <OrderBoard orders={orders} onStatusChange={handleStatusChange} />}
      {activeTab === "tables" && <TableBoard />}
      {activeTab === "history" && <HistoryBoard />}
      
      <Toaster position="top-right" richColors />
    </div>
  )
}
