import { useState, useEffect } from "react"
import { utils, writeFile } from "xlsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Search, Download, Calendar } from "lucide-react"
import { format } from "date-fns"
import { API_URL } from "@/lib/config"

export function HistoryBoard() {
  const [receipts, setReceipts] = useState<any[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionItems, setSessionItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/orders/history`)
      .then(res => res.json())
      .then(data => {
        setReceipts(data)
        setFilteredReceipts(data)
      })
  }, [])

  useEffect(() => {
    let filtered = receipts
    if (search) {
      filtered = filtered.filter(r => r.receipt_number.toLowerCase().includes(search.toLowerCase()) || r.table_id.toString() === search)
    }
    if (dateFilter) {
      filtered = filtered.filter(r => r.created_at.startsWith(dateFilter))
    }
    setFilteredReceipts(filtered)
  }, [search, dateFilter, receipts])

  const handleExport = () => {
    const dataToExport = filteredReceipts.map(r => ({
      "Receipt Number": r.receipt_number,
      "Table": r.table_id,
      "Amount ($)": Number(r.total_amount).toFixed(2),
      "Date": format(new Date(r.created_at), "yyyy-MM-dd HH:mm:ss")
    }))
    
    const worksheet = utils.json_to_sheet(dataToExport)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Receipts")
    writeFile(workbook, `restaurant-receipts-${format(new Date(), "yyyy-MM-dd")}.xlsx`)
  }

  const handleViewItems = (session_id: string) => {
    setSelectedSession(session_id)
    setLoadingItems(true)
    fetch(`${API_URL}/orders/history/${session_id}/items`)
      .then(res => res.json())
      .then(data => {
        setSessionItems(data)
        setLoadingItems(false)
      })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search by receipt or table..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-10"
            />
          </div>
          <div className="relative w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Receipt #</th>
              <th className="p-4 font-semibold text-gray-600">Table</th>
              <th className="p-4 font-semibold text-gray-600">Total</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-600">{format(new Date(r.created_at), "MMM d, yyyy HH:mm")}</td>
                <td className="p-4 font-mono font-medium">{r.receipt_number}</td>
                <td className="p-4 font-bold">Table {r.table_id}</td>
                <td className="p-4 font-bold text-green-700">${Number(r.total_amount).toFixed(2)}</td>
                <td className="p-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewItems(r.session_id)}>View Details</Button>
                </td>
              </tr>
            ))}
            {filteredReceipts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No receipts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b pb-4">
              <DrawerTitle className="text-2xl font-bold">Receipt Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto flex-grow">
              {loadingItems ? (
                <p className="text-center text-gray-500 py-12 animate-pulse">Loading items...</p>
              ) : sessionItems.length > 0 ? (
                <ul className="space-y-4">
                  {sessionItems.map((item: any, idx: number) => (
                     <li key={idx} className="flex justify-between border-b pb-3 border-gray-100">
                     <div>
                       <p className="font-semibold text-lg">{item.quantity}x {item.name}</p>
                       {item.notes && <p className="text-sm text-gray-500 italic mt-1">Note: {item.notes}</p>}
                     </div>
                     <span className="font-bold text-lg mt-1">${(item.price * item.quantity).toFixed(2)}</span>
                   </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-12">No items found for this receipt.</p>
              )}
            </div>
            <DrawerFooter className="border-t pt-4">
              <Button variant="outline" size="lg" className="w-full rounded-xl font-bold" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
