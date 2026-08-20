import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { toast } from "sonner"
import { API_URL } from "@/lib/config"

export function TableBoard() {
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [bill, setBill] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchTables = () => {
    fetch(`${API_URL}/tables`)
      .then(res => res.json())
      .then(data => setTables(data))
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleTableClick = (table: any) => {
    setSelectedTable(table)
    setLoading(true)
    fetch(`${API_URL}/tables/${table.id}/bill`)
      .then(res => res.json())
      .then(data => {
        setBill(data)
        setLoading(false)
      })
  }

  const handleCheckout = async () => {
    if (!selectedTable) return
    try {
      await fetch(`${API_URL}/tables/${selectedTable.id}/checkout`, { method: "POST" })
      toast.success(`Table ${selectedTable.table_number} checked out.`)
      setSelectedTable(null)
      fetchTables() // refresh tables
    } catch (e) {
      toast.error("Failed to checkout table.")
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <Card 
            key={table.id} 
            className={`cursor-pointer transition-all hover:scale-105 shadow-sm ${table.current_session_id ? 'border-green-500 border-2 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
            onClick={() => handleTableClick(table)}
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-gray-800">Table {table.table_number}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {table.current_session_id ? (
                <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">Occupied</span>
              ) : (
                <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">Available</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Drawer open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b pb-4">
              <DrawerTitle className="text-2xl font-bold">Table {selectedTable?.table_number} Bill</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto flex-grow">
              {loading ? (
                <p className="text-center text-gray-500 py-12 animate-pulse">Loading bill...</p>
              ) : bill?.items?.length > 0 ? (
                <ul className="space-y-4">
                  {bill.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between border-b pb-3 border-gray-100">
                      <div>
                        <p className="font-semibold text-lg">{item.quantity}x {item.name}</p>
                        {item.notes && <p className="text-sm text-gray-500 italic mt-1">Note: {item.notes}</p>}
                        <p className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block mt-2 capitalize">Status: {item.status}</p>
                      </div>
                      <span className="font-bold text-lg mt-1">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-12">No orders for this table yet.</p>
              )}
            </div>
            <DrawerFooter className="border-t pt-4">
              <div className="flex justify-between items-center py-3 px-4 mb-2 bg-gray-100 rounded-xl">
                <span className="font-bold text-xl">Total</span>
                <span className="font-bold text-2xl">${bill?.total_amount ? Number(bill.total_amount).toFixed(2) : "0.00"}</span>
              </div>
              
              <Button 
                onClick={handleCheckout} 
                className="w-full rounded-xl font-bold" 
                size="lg" 
                disabled={!bill?.items?.length || bill.items.some((item: any) => item.status !== "Served")}
              >
                {bill?.items?.length && bill.items.some((item: any) => item.status !== "Served") 
                  ? "Cannot Checkout: Items Not Served" 
                  : "Checkout & Clear Table"}
              </Button>
              
              <Button variant="outline" size="lg" className="w-full mt-2 rounded-xl font-bold" onClick={() => setSelectedTable(null)}>
                Close
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
