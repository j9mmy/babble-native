import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Send, Menu, User, Settings, LogOut, ChevronDown, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface MessageProps {
    id: number;
    conversationId: number;
    message: string;
    isAi: boolean;
}

function App() {
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [models, setModels] = useState([
        "google/gemma-1.1-7b-it",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "meta-llama/Meta-Llama-3-70B-Instruct",
        "mistralai/Mistral-Nemo-Instruct-2407"
    ])
    const [currentModel, setCurrentModel] = useState(models[0]);

    return (
        <div className="flex flex-col h-screen py-2">
            <header className="flex justify-between items-center p-2 pt-0">
                <div className="flex gap-2 w-full">
                    <Sheet>
                        <SheetTrigger>
                            <Button variant={"ghost"} size={"icon"}><Menu size={16}/></Button>
                        </SheetTrigger>
                        <SheetContent side={"left"} className="h-fit w-fit m-4 p-0 rounded-lg">
                            <SheetHeader className="p-4 pb-2 pt-3">
                                <SheetTitle className="text-xl font-extrabold">Babble</SheetTitle>
                            </SheetHeader>
                            <hr className="w-full h-0.5 bg-stone-100" />
                            <SheetDescription className="p-4 py-2 text-stone-900 font-bold">Previous Babbles</SheetDescription>
                            <div className="w-full pb-2">
                                <Button className="w-full justify-start rounded-none" variant="ghost">Trip to Italy</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">Digital Nomadism</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">Test Article</Button>
                            </div>
                            <hr className="w-full h-0.5 bg-stone-100" />
                            <SheetDescription className="p-4 py-2 text-stone-900 font-bold">Miscellaneous</SheetDescription>
                            <div className="w-full pb-2">
                                <Button className="w-full justify-start rounded-none" variant="ghost">Help</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">Feedback</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">About</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">GitHub</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Button className="p-3" variant="ghost"><Plus size={16}/></Button>
                </div>
                <div className="flex flex-row items-center justify-center w-full">
                    <p className="w-max text-sm">You are now babbling    to</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="link" className="font-bold px-1 h-auto gap-1">
                                {currentModel}
                                <ChevronDown size={12} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto">
                            <DropdownMenuLabel>Switch model</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {models.map((model, index) => (
                                    <DropdownMenuItem key={index} onSelect={() => setCurrentModel(model)}>
                                        <span>{model}</span>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Add new model</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-row w-full me-2 justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="link" className="flex flex-row gap-2 w-max h-max p-0">
                                <Avatar>
                                    <AvatarFallback>LP</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="me-4 mt-1 w-48">
                            <DropdownMenuLabel>Leslie Parrish</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <ScrollArea>
                <div className="flex flex-col gap-2 h-full max-w-screen-md mx-auto px-8 mb-8">
                    <Message message="Hi there! 👋" isAi={false} />
                    <Message message="Hello! 😊 How can I assist you today?" isAi={true} />
                    <Message message="I'm planning a trip to Italy. Any recommendations on places to visit?" isAi={false} />
                    <Message message={`Absolutely! Italy is beautiful with so much to offer. Here are a few must-visit places:

1. **Rome** – Explore the Colosseum, Vatican City, and enjoy delicious Italian cuisine.
2. **Florence** – Perfect for art lovers; don't miss the Uffizi Gallery and the Duomo.
3. **Venice** – Experience the unique canals and stunning architecture.
4. **Amalfi Coast** – Beautiful coastal views and charming towns like Positano and Amalfi.
5. **Tuscany** – Ideal for wine tasting and enjoying the scenic countryside.

Would you like more details on any of these places?`} isAi={true} />
                    <Message message="Yes, tell me more about Florence!" isAi={false} />
                    <Message message={`Florence is the heart of the Italian Renaissance and offers a rich cultural experience. Here are some highlights:

- **Uffizi Gallery:** Home to masterpieces by Leonardo da Vinci, Michelangelo, and Botticelli.
- **Ponte Vecchio:** A historic bridge lined with jewelry shops.
- **Duomo di Firenze:** Stunning cathedral with a magnificent dome designed by Brunelleschi.
- **Piazzale Michelangelo:** Offers panoramic views of the city—perfect for sunset!
- **Boboli Gardens:** Beautiful gardens behind the Pitti Palace, great for a relaxing stroll.

Don't forget to try the local Florentine steak and gelato while you're there!`} isAi={true} />
                    <Message message="That sounds amazing! Any tips on getting around the city?" isAi={false} />
                    <Message message={`Sure! Here are some tips for navigating Florence:

1. **Walking:** Florence is a compact city, and many attractions are within walking distance.
2. **Public Transportation:** Buses are available for longer distances. The ATAF bus network covers most areas.
3. **Biking:** Renting a bike can be a fun way to explore, though some historic streets may be narrow.
4. **Taxis:** Easily available but can be more expensive. Useful for late-night travel.
5. **Trains:** If you're traveling to nearby cities, the train station (Santa Maria Novella) is centrally located.

Additionally, consider purchasing a Firenze Card for unlimited access to museums and public transport.`} isAi={true} />
                    <Message message="Great tips, thanks! One last thing — any local dishes I should try?" isAi={false} />
                    <Message message={`Absolutely! Italian cuisine is diverse and delicious. Here are some local dishes to try in Florence:

- **Bistecca alla Fiorentina:** A thick, juicy T-bone steak grilled to perfection.
- **Ribollita:** A hearty Tuscan vegetable and bread soup.
- **Pappa al Pomodoro:** A thick tomato and bread soup, often flavored with basil and garlic.
- **Lampredotto:** A traditional Florentine street food made from cow's stomach, served in a sandwich.
- **Crostini Toscani:** Toasted bread topped with chicken liver pâté.
- **Gelato:** Don't miss trying authentic Italian gelato from one of the many gelaterias.

Enjoy your culinary adventures in Florence! 🍝🍷`} isAi={true} />
                    <Message message="Awesome! Thanks for all the help. 😊" isAi={false} />
                    <Message message="You're welcome! Have an amazing trip to Italy! If you have any more questions, feel free to ask. Safe travels! ✈️🇮🇹" isAi={true} />
                    <Message message="Could you create a small article so I can test all the typography like headings, lists, paragraphs, etc.?" isAi={false} />
                    <Message message={`## **The Art of Digital Nomadism: Embracing the Freedom of Remote Work**

### **Introduction**

In recent years, the concept of digital nomadism has gained significant popularity. With advances in technology and the rise of remote work opportunities, more and more individuals are choosing to work from anywhere in the world. But what does it really mean to be a digital nomad, and how can you successfully embrace this lifestyle?

### **What is Digital Nomadism?**

Digital nomadism refers to a lifestyle in which individuals leverage technology to work remotely, often while traveling to different locations. These nomads are not bound to a single place and can perform their job from cafes, coworking spaces, or even a beach in Bali. The key elements that define a digital nomad include:

1. **Location Independence:** The ability to work from anywhere.
2. **Remote Work:** Utilizing technology to perform tasks from a distance.
3. **Travel:** Often moving between different cities or countries.

### **Benefits of Being a Digital Nomad**

Embracing the digital nomad lifestyle offers numerous benefits:

- **Flexibility:** You can create your own schedule and work during your most productive hours.
- **Cultural Exposure:** Traveling allows you to experience new cultures, cuisines, and languages.
- **Cost Savings:** Depending on where you choose to live, you might find it cheaper than staying in a major city.
- **Work-Life Balance:** By controlling your environment, you can create a balance that suits you.

### **Challenges to Consider**

However, digital nomadism is not without its challenges. Here are a few to keep in mind:

- **Isolation:** Being away from family and friends can lead to loneliness.
- **Time Zones:** Working with teams across different time zones can be tricky.
- **Stability:** Constant travel can be exhausting and disruptive to your routine.

### **Tips for Aspiring Digital Nomads**

If you're considering becoming a digital nomad, here are some tips to help you get started:

#### **1. Choose the Right Tools**

Equip yourself with essential tools:

- **Laptop:** A lightweight, powerful laptop is a must.
- **VPN:** Ensure secure internet connections, especially on public Wi-Fi.
- **Project Management Tools:** Platforms like Trello or Asana keep you organized.
- **Communication Tools:** Use Slack, Zoom, or Microsoft Teams to stay in touch with your team.

#### **2. Find Reliable Accommodation**

Accommodation plays a crucial role in your productivity. Look for places with:

- **High-speed Internet:** Non-negotiable for remote work.
- **Quiet Workspaces:** A place where you can focus without distractions.
- **Proximity to Amenities:** Ensure you're near grocery stores, cafes, and public transport.

#### **3. Manage Your Time Effectively**

Time management is key:

- **Set a Routine:** Even though you're flexible, a routine can help maintain productivity.
- **Use Time-Blocking:** Allocate specific times for work, leisure, and exploration.
- **Prioritize Tasks:** Focus on high-priority tasks to avoid feeling overwhelmed.

### **Conclusion**

Digital nomadism offers an exciting way to combine work and travel, providing both professional and personal fulfillment. While it comes with challenges, proper planning and the right mindset can help you make the most of this lifestyle. So, pack your bags, grab your laptop, and get ready to explore the world while you work!`} isAi={true} />
                </div>
            </ScrollArea>
            <footer className="flex justify-center items-center w-full p-2 pt-2">
                <div className="flex flex-row max-w-screen-md w-full gap-2">
                    <Input className="bg-stone-100" placeholder={"Babble to " + currentModel} />
                    <Button className="p-3"><Send size={16}/></Button>
                </div>
            </footer>
        </div>
    );
}

export default App;