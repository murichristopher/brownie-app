import { Coins, TrendingUp, History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type User = {
  email?: string
  coins?: number
  profile_picture?: string
}

export default function CoinBalance({ user }: { user?: User }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-secondary rounded-full px-3 py-1.5">
        <Coins className="h-4 w-4 text-yellow-500 mr-1.5" />
        <span className="font-semibold tabular-nums">{user?.coins || 0}</span>
        <span className="ml-1.5 text-muted-foreground text-sm">AXO</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <TrendingUp className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <TrendingUp className="h-4 w-4 mr-2" />
            Earn More
          </DropdownMenuItem>
          <DropdownMenuItem>
            <History className="h-4 w-4 mr-2" />
            History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}