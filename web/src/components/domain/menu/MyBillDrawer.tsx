import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/config"

export function MyBillDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [bill, setBill] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch(`${API_URL}/tables/12/bill`)
        .then(res => res.json())
        .then(data => {
          setBill(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [open])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md max-h-[85vh] flex flex-col">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-2xl font-bold">Your Running Bill</DrawerTitle>
            <DrawerDescription className="text-base">Table 12</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto space-y-4 flex-grow">
            {loading ? (
              <p className="text-center text-gray-500 py-12 animate-pulse">Fetching your bill...</p>
            ) : bill && bill.items.length > 0 ? (
              <ul className="space-y-4">
                {bill.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-start border-b pb-3 border-gray-100">
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-lg">{item.quantity}x {item.name}</p>
                      {item.notes && <p className="text-sm text-gray-500 italic mt-1">Note: {item.notes}</p>}
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-600 capitalize">
                        Status: {item.status}
                      </span>
                    </div>
                    <span className="font-bold text-lg mt-1">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-12">You haven't ordered anything yet.</p>
            )}
          </div>
          <DrawerFooter className="border-t pt-4">
            <div className="flex justify-between items-center py-3 px-4 mb-2 bg-gray-100 rounded-xl">
              <span className="font-bold text-xl">Total</span>
              <span className="font-bold text-2xl">${bill?.total_amount ? Number(bill.total_amount).toFixed(2) : "0.00"}</span>
            </div>
            <Button variant="outline" size="lg" className="w-full rounded-xl font-bold" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
