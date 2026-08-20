"use client"
import { useState, useMemo } from "react"
import { MenuCard, MenuItem } from "@/components/domain/menu/MenuCard"
import { ItemDrawer } from "@/components/domain/menu/ItemDrawer"
import { useCart } from "@/components/domain/cart/CartContext"
import { API_URL } from "@/lib/config"
import { motion, AnimatePresence } from "framer-motion"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Search, ReceiptText, BellRing } from "lucide-react"
import { MyBillDrawer } from "@/components/domain/menu/MyBillDrawer"

const MOCK_MENU: MenuItem[] = [
  // Starters
  { id: 1, name: "Crispy Spring Rolls", description: "Golden fried vegetable spring rolls with sweet chili sauce", price: 5.99, category: "Starters", image_url: "/menu/1.png" },
  { id: 2, name: "Edamame", description: "Steamed soybeans with sea salt", price: 4.99, category: "Starters", image_url: "/menu/2.png" },
  { id: 3, name: "Chicken Dumplings", description: "Pan-fried dumplings with soy dipping sauce", price: 6.99, category: "Starters", image_url: "/menu/3.png" },
  { id: 4, name: "Calamari Rings", description: "Lightly battered and fried squid rings", price: 8.99, category: "Starters", image_url: "/menu/4.png" },
  
  // Mains
  { id: 5, name: "Classic Cheeseburger", description: "Juicy beef patty with cheese, lettuce, and tomato", price: 12.99, category: "Mains", image_url: "/menu/5.png" },
  { id: 6, name: "Spicy Beef Noodles", description: "Rich broth with tender beef and hand-pulled noodles", price: 14.99, category: "Mains", image_url: "/menu/6.png" },
  { id: 7, name: "Grilled Salmon", description: "Fresh salmon steak with seasonal vegetables", price: 18.99, category: "Mains", image_url: "/menu/7.png" },
  { id: 8, name: "Margarita Pizza", description: "Wood-fired pizza with fresh basil and mozzarella", price: 15.99, category: "Mains", image_url: "/menu/8.png" },
  { id: 9, name: "Chicken Alfredo", description: "Creamy fettuccine pasta with grilled chicken", price: 16.99, category: "Mains", image_url: "/menu/9.png" },
  { id: 10, name: "Truffle Risotto", description: "Creamy mushroom risotto infused with truffle oil", price: 17.99, category: "Mains", image_url: "/menu/10.png" },
  
  // Drinks
  { id: 11, name: "Matcha Latte", description: "Iced green tea latte with boba", price: 5.99, category: "Drinks", image_url: "/menu/11.png" },
  { id: 12, name: "Mango Smoothie", description: "Freshly blended tropical mango smoothie", price: 6.50, category: "Drinks", image_url: "/menu/12.png" },
  { id: 13, name: "Craft Beer", description: "Local IPA on tap", price: 7.00, category: "Drinks", image_url: "/menu/13.png" },
  
  // Desserts
  { id: 14, name: "Lava Cake", description: "Warm chocolate cake with a gooey center", price: 8.99, category: "Desserts", image_url: "/menu/14.png" },
  { id: 15, name: "Cheesecake", description: "New York style cheesecake with berry compote", price: 7.99, category: "Desserts", image_url: "/menu/15.png" },
]

const CATEGORIES = ["All", "Starters", "Mains", "Drinks", "Desserts"]

export default function MenuPage() {
  const { addItem, items, total, clearCart } = useCart()
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isBillOpen, setIsBillOpen] = useState(false)
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const payload = {
        table_id: 12, 
        session_id: "sess_123",
        total_amount: total,
        items: items.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          notes: i.notes || null,
          price_at_time: i.price
        }))
      }

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to checkout")
      
      toast.success("Order Placed Successfully!", {
        description: "Your food is being prepared in the kitchen."
      })
      clearCart()
    } catch (error) {
      toast.error("Checkout Failed", { description: "Please try again later." })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleCallServer = async () => {
    try {
      await fetch(`${API_URL}/tables/12/call-server`, { method: "POST" })
      toast.success("Server called!", { description: "Someone will be right with you." })
    } catch (error) {
      toast.error("Failed to call server")
    }
  }

  // Filter Logic
  const filteredMenu = useMemo(() => {
    return MOCK_MENU.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "All" || item.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory])

  return (
    <div className="space-y-4 pb-20">
      {/* Sticky Header with Search and Categories */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md pt-2 pb-4 px-2 -mx-2 shadow-sm space-y-4">
        <div className="relative mx-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Search for a dish..." 
            className="pl-10 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar px-2 space-x-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === category 
                  ? "bg-black text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredMenu.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No dishes found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredMenu.map(item => (
            <MenuCard key={item.id} item={item} onClick={handleItemClick} />
          ))}
        </div>
      )}
      
      <ItemDrawer 
        item={selectedItem} 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onAdd={addItem} 
      />

      <MyBillDrawer open={isBillOpen} onOpenChange={setIsBillOpen} />

      {/* Floating Action Buttons */}
      <div className="fixed top-36 right-4 flex flex-col gap-4 z-30">
        <button 
          onClick={() => setIsBillOpen(true)}
          className="bg-white text-black p-4 rounded-full shadow-xl border border-gray-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <ReceiptText className="w-6 h-6" />
        </button>
        <button 
          onClick={handleCallServer}
          className="bg-red-500 text-white p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <BellRing className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50"
          >
            <div className="max-w-md mx-auto flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{items.reduce((acc, i) => acc + i.quantity, 0)} items</p>
                <p className="text-sm font-semibold text-gray-500">Total: ${total.toFixed(2)}</p>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isCheckingOut ? "Sending..." : "Place Order"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-center" richColors />
    </div>
  )
}
