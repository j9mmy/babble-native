import { Plus, Bot, Key, MessagesSquare, Settings, ChevronDown, MoreHorizontal } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarMenuAction,
  useSidebar,
} from "./ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useConversations } from "../context/ConversationContext"
import { ModeToggle } from "./mode-toggle"
import { useModal } from "../context/ModalContext"

export function AppSidebar() {
  
  return (
    <Sidebar side="left" variant="floating" collapsible="icon" className="font-medium">

      <SidebarContent>
        <SidebarGroup className="gap-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <NewConversationMenuItem />
              <ConversationsMenuItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle variant={"sidebar"}/>
          </SidebarMenuItem>
          <ChangeModelMenuItem />
          <ChangeAccessTokenMenuItem />
          <SettingsMenuItem />
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}

function NewConversationMenuItem() {
  const { activeConversationId, setActiveConversationId } = useConversations();
  const { setOpenMobile } = useSidebar();

  function handleNewConversation() {
    setActiveConversationId(null);
    setOpenMobile(false);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={!activeConversationId} onClick={() => handleNewConversation()}>
        <Plus />
        <span>New conversation</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function ConversationsMenuItem() {

  return (
    /* No SidebarMenuItem component for this as it somehow breaks the arrow animation -_- */

    <Collapsible defaultOpen className="group/collapsible">
      <CollapsibleTrigger asChild>
        <SidebarMenuButton>
          <MessagesSquare />
          <span>Conversations</span>
          <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180 ml-auto"/>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ConversationsMenuSubItems />
      </CollapsibleContent>
    </Collapsible>
  )
}

function ConversationsMenuSubItems() {
  const { conversations, activeConversation, setActiveConversationId } = useConversations();
  const { setModal, setIsOpen } = useModal();

  function handleEditConversation(id: string) {
    setModal({ type: "edit", id });
    setIsOpen(true);
  }

  function handleDeleteConversation(id: string) {
    setModal({ type: "delete", id });
    setIsOpen(true);
  }

  return (
    conversations.length > 0 ? (
      <SidebarMenuSub className="gap-1 pe-0 me-0 overflow-x-clip">
        {[...conversations].reverse().map((conv) => (
          <SidebarMenuItem key={conv.id}>
            <SidebarMenuSubButton 
              isActive={conv.id == activeConversation?.id} 
              onClick={() => setActiveConversationId(conv.id)}
              className="hover:cursor-pointer"
            >
              <span className="me-6">{conv.title}</span>
            </SidebarMenuSubButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction className="me-[3px]">
                  <MoreHorizontal strokeWidth={1}/>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="center" className="ms-7">
                <DropdownMenuItem onClick={() => handleEditConversation(conv.id)}>
                  <span className="text-xs">Edit conversation</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteConversation(conv.id)}>
                  <span className="text-xs">Delete conversation</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenuSub>
    ) : (
      <SidebarMenuSub className="overflow-x-clip">
        <SidebarMenuSubItem className="px-2 mt-1 overflow-x-clip text-nowrap text-xs font-normal">
          <span>No conversations yet</span>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    )
  )
}

function ChangeModelMenuItem() {
  const { setModal, setIsOpen } = useModal();

  function handleChangeModel() {
    setModal({ type: "model" });
    setIsOpen(true);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => handleChangeModel()}>
        <Bot />
        <span>Model</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function ChangeAccessTokenMenuItem() {
  const { setModal, setIsOpen } = useModal();

  function handleChangeAccessToken() {
    setModal({ type: "token" });
    setIsOpen(true);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => handleChangeAccessToken()}>
        <Key />
        <span>Access Token</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SettingsMenuItem() {

  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <Settings />
        <span>Settings</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}