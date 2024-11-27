import { ChevronUp, Moon, Sun } from "lucide-react"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme } from "../context/ThemeContext"
import { SidebarMenuButton, useSidebar } from "./ui/sidebar"

type Variant = "default" | "sidebar";

export function ModeToggle({variant}: {variant: Variant}) {
  const { setTheme } = useTheme();
  const { state } = useSidebar();

  const Items = () => {
    return (
      <>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </>
    )
  }

  switch (variant) {
    case "default":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
          >
            <Items />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    case "sidebar":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="text-nowrap">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              Theme
              <ChevronUp className="ml-auto"/>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side={state === "collapsed" ? "right" : "top"} 
            className={`w-[--radix-popper-anchor-width] ${state === "collapsed" && "ms-5"}`}
          >
            <Items />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    default:
      return null
  }
}