import { LogOut, User } from "lucide-react"
import { useAuthStore } from "@/features/auth/store"
import { Button } from "./button"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "./dropdown-menu"

export function UserNav() {
 const logout = useAuthStore((state) => state.logout)

 return (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="rounded-full">
 <User className="h-5 w-5" />
 <span className="sr-only">Menú de usuario</span>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56">
 <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem onClick={() => { logout() }} className="text-destructive focus:text-destructive">
 <LogOut className="mr-2 h-4 w-4" />
 <span>Cerrar sesión</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 )
}
