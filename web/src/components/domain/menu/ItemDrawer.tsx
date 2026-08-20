import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MenuItem } from "./MenuCard"

export function ItemDrawer({ item, open, onOpenChange, onAdd }: { item: MenuItem | null, open: boolean, onOpenChange: (open: boolean) => void, onAdd: (item: MenuItem, quantity: number, notes: string) => void }) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open) {
      setQuantity(1)
      setNotes("")
    }
  }, [open])

  if (!item) return null

  const handleAdd = () => {
    onAdd(item, quantity, notes)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 overflow-hidden">
        <div className="mx-auto w-full max-w-md flex flex-col max-h-[90vh]">
          {/* Hero Image Section */}
          <div className="w-full h-64 relative flex-shrink-0">
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <DrawerHeader className="w-full text-left text-white pb-6">
                <DrawerTitle className="text-2xl font-bold">{item.name}</DrawerTitle>
                <DrawerDescription className="text-gray-200 text-lg">${item.price.toFixed(2)}</DrawerDescription>
              </DrawerHeader>
            </div>
          </div>
          
          {/* Scrollable Content Section */}
          <div className="p-4 space-y-6 overflow-y-auto">
            <p className="text-gray-600">{item.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Quantity</span>
              <div className="flex items-center space-x-4 bg-gray-100 rounded-full p-1">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                <span className="w-4 text-center font-bold text-lg">{quantity}</span>
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0" onClick={() => setQuantity(q => q + 1)}>+</Button>
              </div>
            </div>
            
            <div className="space-y-3 pb-4">
              <span className="font-semibold">Special Instructions</span>
              <Textarea 
                placeholder="e.g. No onions, extra spicy, sauce on the side..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="resize-none h-24"
              />
            </div>
          </div>
          
          {/* Fixed Footer */}
          <DrawerFooter className="pt-2 pb-6 border-t mt-auto">
            <Button size="lg" className="text-lg rounded-xl" onClick={handleAdd}>
              Add to Cart - ${(item.price * quantity).toFixed(2)}
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
