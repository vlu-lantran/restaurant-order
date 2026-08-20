import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export function MenuCard({ item, onClick }: { item: MenuItem; onClick: (item: MenuItem) => void }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
      <Card className="cursor-pointer overflow-hidden border-none shadow-md hover:shadow-lg transition-all h-full flex flex-col" onClick={() => onClick(item)}>
        <div className="h-40 w-full overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform hover:scale-105" />
        </div>
        <CardHeader className="p-4 pb-2 flex-grow">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-semibold leading-tight">{item.name}</CardTitle>
            <span className="font-bold text-black">${item.price.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 mt-auto">
          <CardDescription className="line-clamp-2 text-xs">{item.description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}
