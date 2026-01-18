import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useRequests } from "@/hooks/use-requests";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: requests } = useRequests();
  
  // Get accepted request partners
  const partners = requests
    ?.filter(r => r.status === 'accepted')
    .map(r => r.otherUser)
    // De-duplicate users
    .filter((u, index, self) => index === self.findIndex(t => t.id === u.id)) || [];

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Check URL param for initial user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (userId) setSelectedUserId(Number(userId));
    else if (partners.length > 0 && !selectedUserId) {
      setSelectedUserId(partners[0].id);
    }
  }, [partners.length]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 container mx-auto p-4 flex gap-4 h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Card className="w-80 flex flex-col border-border/50 h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {partners.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No accepted swap requests yet.
              </div>
            ) : (
              partners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => setSelectedUserId(partner.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    selectedUserId === partner.id ? "bg-secondary" : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={partner.avatarUrl || undefined} />
                    <AvatarFallback>{partner.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{partner.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Click to chat</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col border-border/50 overflow-hidden h-full">
          {selectedUserId ? (
            <ChatWindow userId={selectedUserId} partners={partners} />
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
               <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                 <UserIcon className="h-8 w-8 opacity-50" />
               </div>
               <p>Select a conversation to start chatting</p>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ChatWindow({ userId, partners }: { userId: number, partners: any[] }) {
  const { data: messages, isLoading } = useMessages(userId);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const partner = partners.find(p => p.id === userId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    sendMessage.mutate({
      receiverId: userId,
      content: text
    });
    setText("");
  };

  if (!partner) return null;

  return (
    <>
      <div className="p-4 border-b border-border flex items-center gap-3 bg-secondary/20">
        <Avatar className="h-10 w-10">
          <AvatarImage src={partner.avatarUrl} />
          <AvatarFallback>{partner.username[0]}</AvatarFallback>
        </Avatar>
        <div>
           <p className="font-bold">{partner.name}</p>
           <p className="text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : messages?.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          messages?.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div 
                  className={cn(
                    "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white dark:bg-card border border-border rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-primary/20"
          />
          <Button type="submit" size="icon" className="rounded-full h-10 w-10 shadow-md" disabled={!text.trim() || sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
