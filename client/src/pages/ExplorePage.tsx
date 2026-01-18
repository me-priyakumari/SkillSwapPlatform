import { useState } from "react";
import { useSkills } from "@/hooks/use-skills";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRequest } from "@/hooks/use-requests";
import { useAuth } from "@/hooks/use-auth";
import { Skill } from "@shared/schema";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [type, setType] = useState<'teach' | 'learn' | undefined>();
  
  const { data: skills, isLoading } = useSkills({ search, category, type });

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Skills</h1>
            <p className="text-muted-foreground">Find people to learn from or teach to.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search skills..." 
                 className="pl-9 bg-background"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <Button variant="outline" size="icon">
               <Filter className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={!type ? "default" : "outline"} 
            onClick={() => setType(undefined)}
            className="rounded-full"
          >
            All
          </Button>
          <Button 
            variant={type === 'teach' ? "default" : "outline"} 
            onClick={() => setType('teach')}
            className="rounded-full gap-2"
          >
            <GraduationCap className="h-4 w-4" /> Teaching
          </Button>
          <Button 
            variant={type === 'learn' ? "default" : "outline"} 
            onClick={() => setType('learn')}
            className="rounded-full gap-2"
          >
            <BookOpen className="h-4 w-4" /> Learning
          </Button>
          <div className="w-px h-8 bg-border mx-2" />
          {["Tech", "Design", "Language", "Music", "Business"].map(cat => (
             <Button
               key={cat}
               variant={category === cat ? "secondary" : "ghost"}
               onClick={() => setCategory(category === cat ? undefined : cat)}
               className="rounded-full font-normal"
             >
               {cat}
             </Button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : skills?.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
            <h3 className="text-xl font-bold mb-2">No skills found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills?.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill & { user: any } }) {
  const { user } = useAuth();
  const createRequest = useCreateRequest();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const isOwnSkill = user?.id === skill.userId;

  const handleRequest = () => {
    createRequest.mutate({
      receiverId: skill.userId,
      skillId: skill.id,
      message,
    }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/50 overflow-hidden flex flex-col h-full relative">
      <Badge 
        variant="outline" 
        className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm text-muted-foreground font-medium shadow-sm border-primary/20"
      >
        {skill.category}
      </Badge>
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge 
            variant={skill.type === 'teach' ? "default" : "secondary"} 
            className="rounded-md px-3 py-1 font-semibold"
          >
            {skill.type === 'teach' ? "Teaching" : "Wants to Learn"}
          </Badge>
        </div>
        <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{skill.title}</h3>
      </CardHeader>
      
      <CardContent className="px-6 py-0 flex-1">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6">
          {skill.description}
        </p>
        
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={skill.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${skill.user.username}`} />
            <AvatarFallback>{skill.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{skill.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{skill.user.location || "Remote"}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-4">
        {isOwnSkill ? (
          <Button variant="outline" className="w-full" disabled>Your Skill</Button>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full shadow-lg shadow-primary/10 group-hover:shadow-primary/25 transition-all">
                Request Swap <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a Swap</DialogTitle>
                <DialogDescription>
                  Send a message to {skill.user.name} proposing a skill exchange.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea 
                  placeholder="Hi! I'd love to learn about this. I can teach you..." 
                  className="min-h-[100px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleRequest} disabled={createRequest.isPending}>
                  {createRequest.isPending ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
