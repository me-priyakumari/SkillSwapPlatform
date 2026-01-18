import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequests, useUpdateRequestStatus } from "@/hooks/use-requests";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare, Clock } from "lucide-react";
import { Link } from "wouter";

export default function RequestsPage() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useRequests();
  const updateStatus = useUpdateRequestStatus();

  if (!user) return null;

  const received = requests?.filter(r => r.receiverId === user.id) || [];
  const sent = requests?.filter(r => r.senderId === user.id) || [];

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Swap Requests</h1>

        <Tabs defaultValue="received" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-card border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="received" className="rounded-lg">Received ({received.filter(r => r.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="sent" className="rounded-lg">Sent ({sent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {isLoading ? <RequestsSkeleton /> : received.length === 0 ? <EmptyState type="received" /> : (
              received.map(req => (
                <RequestCard 
                  key={req.id} 
                  request={req} 
                  isReceived 
                  onAccept={() => updateStatus.mutate({ id: req.id, status: 'accepted' })}
                  onReject={() => updateStatus.mutate({ id: req.id, status: 'rejected' })}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {isLoading ? <RequestsSkeleton /> : sent.length === 0 ? <EmptyState type="sent" /> : (
              sent.map(req => (
                <RequestCard key={req.id} request={req} isReceived={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function RequestCard({ 
  request, 
  isReceived, 
  onAccept, 
  onReject 
}: { 
  request: any, 
  isReceived: boolean,
  onAccept?: () => void,
  onReject?: () => void
}) {
  const otherUser = isReceived ? request.senderId : request.receiverId; // In a real app we'd join sender too
  // Note: API returns 'otherUser' correctly populated for both cases in the schema join logic
  // But for this simple types demo, 'otherUser' from the hook payload is what we use.
  
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  }[request.status as string] || "bg-gray-100";

  return (
    <Card className="overflow-hidden border-border/60 hover:border-border transition-all">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex items-center gap-4 min-w-[200px]">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={request.otherUser.avatarUrl} />
            <AvatarFallback>{request.otherUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{request.otherUser.name}</p>
            <p className="text-sm text-muted-foreground">{isReceived ? "Wants to swap" : "You requested"}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
           <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-muted-foreground">Skill:</span>
             <Badge variant="outline" className="text-base py-0.5">{request.skill.title}</Badge>
           </div>
           {request.message && (
             <div className="bg-muted/50 p-3 rounded-lg text-sm italic text-muted-foreground">
               "{request.message}"
             </div>
           )}
        </div>

        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          <Badge variant="outline" className={`capitalize px-3 py-1 ${statusColor}`}>
            {request.status}
          </Badge>

          {isReceived && request.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onReject}>
                Reject
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}

          {request.status === 'accepted' && (
             <Link href={`/messages?userId=${request.otherUser.id}`}>
               <Button size="sm" variant="secondary" className="gap-2">
                 <MessageSquare className="h-4 w-4" /> Chat
               </Button>
             </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: 'received' | 'sent' }) {
  return (
    <div className="text-center py-16 bg-card border border-dashed rounded-xl">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        {type === 'received' ? <Clock className="h-8 w-8 text-muted-foreground" /> : <MessageSquare className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-bold mb-2">{type === 'received' ? "No requests yet" : "No sent requests"}</h3>
      <p className="text-muted-foreground mb-6">
        {type === 'received' 
          ? "When someone wants to learn from you, it will appear here." 
          : "Explore skills and send requests to start swapping!"}
      </p>
      {type === 'sent' && (
        <Link href="/explore">
          <Button>Explore Skills</Button>
        </Link>
      )}
    </div>
  );
}

function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
