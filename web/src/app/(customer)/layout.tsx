import { CartProvider } from "@/components/domain/cart/CartContext"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
          <h1 className="text-xl font-bold text-center">Restaurant Menu</h1>
        </header>
        <main className="p-4 max-w-md mx-auto">
          {children}
        </main>
      </div>
    </CartProvider>
  )
}
