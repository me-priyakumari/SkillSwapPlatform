import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { useSkills, useCreateSkill } from "@/hooks/use-skills";
import { useReviews } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Edit, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSkillSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { user: currentUser } = useAuth();
  const { data: profileUser, isLoading: userLoading } = useUser(userId);
  const { data: skills } = useSkills(); // In real app, filter by userId in API
  const { data: reviews } = useReviews(userId);

  const isOwnProfile = currentUser?.id === userId;
  const userSkills = skills?.filter(s => s.userId === userId) || [];

  if (userLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!profileUser) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-primary to-accent opacity-90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 -mt-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0">
             <Card className="shadow-lg border-border/50 overflow-hidden">
               <div className="p-6 flex flex-col items-center text-center">
                 <div className="relative mb-4">
                   <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                     <AvatarImage src={profileUser.avatarUrl || undefined} />
                     <AvatarFallback className="text-4xl">{profileUser.name[0]}</AvatarFallback>
                   </Avatar>
                   {isOwnProfile && <EditProfileDialog user={profileUser} />}
                 </div>
                 
                 <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                 <p className="text-muted-foreground mb-4">@{profileUser.username}</p>
                 
                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                   <MapPin className="h-4 w-4" />
                   {profileUser.location || "No location set"}
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                   <Calendar className="h-4 w-4" />
                   {profileUser.availability || "Flexible availability"}
                 </div>

                 {!isOwnProfile && (
                   <Button className="w-full">Message</Button>
                 )}
               </div>
               
               <div className="border-t border-border p-6 bg-secondary/20">
                 <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">About</h3>
                 <p className="text-sm leading-relaxed">{profileUser.bio || "No bio yet."}</p>
               </div>
             </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6 w-full">
            <Tabs defaultValue="skills">
              <TabsList className="w-full justify-start h-14 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl p-1.5 mb-8 gap-2 shadow-inner">
                <TabsTrigger 
                  value="skills" 
                  className="flex-1 md:flex-none rounded-lg px-8 py-2 font-bold text-base transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-primary/70"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="flex-1 md:flex-none rounded-lg px-8 py-2 font-bold text-base transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:text-primary/70"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-bold">Skills Offered & Wanted</h2>
                   {isOwnProfile && <AddSkillDialog />}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {userSkills.map(skill => (
                    <Card key={skill.id} className="border-border/60 hover:border-border transition-all">
                      <CardHeader className="p-4 pb-2">
                         <div className="flex justify-between items-start">
                           <Badge variant={skill.type === 'teach' ? "default" : "secondary"}>
                             {skill.type === 'teach' ? "Teaching" : "Learning"}
                           </Badge>
                           <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">{skill.category}</span>
                         </div>
                         <CardTitle className="text-lg mt-2">{skill.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {userSkills.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-card border border-dashed rounded-xl">
                      <p className="text-muted-foreground">No skills listed yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  {reviews?.map(review => (
                    <Card key={review.id} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                               <AvatarImage src={review.author.avatarUrl} />
                               <AvatarFallback>{review.author.username[0]}</AvatarFallback>
                             </Avatar>
                             <span className="font-semibold text-sm">{review.author.name}</span>
                           </div>
                           <div className="flex text-yellow-400 text-sm">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                             ))}
                           </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{review.feedback}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {reviews?.length === 0 && (
                     <div className="py-12 text-center bg-card border border-dashed rounded-xl">
                       <p className="text-muted-foreground">No reviews yet.</p>
                     </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSkillDialog() {
  const [open, setOpen] = useState(false);
  const createSkill = useCreateSkill();
  
  const form = useForm<z.infer<typeof insertSkillSchema>>({
    resolver: zodResolver(insertSkillSchema.omit({ userId: true })),
    defaultValues: { title: "", description: "", category: "Tech", type: "teach" },
  });

  const onSubmit = (data: any) => {
    createSkill.mutate(data, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Skill</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Skill</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Title</FormLabel>
                  <FormControl><Input placeholder="e.g. React.js, Piano, Spanish" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="teach">I can teach this</SelectItem>
                      <SelectItem value="learn">I want to learn this</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tech">Tech & Coding</SelectItem>
                      <SelectItem value="Design">Design & Art</SelectItem>
                      <SelectItem value="Language">Language</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe what you can offer or want to learn..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createSkill.isPending}>
              {createSkill.isPending ? "Adding..." : "Add Skill"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditProfileDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser();

  const form = useForm({
    defaultValues: {
      bio: user.bio || "",
      location: user.location || "",
      availability: user.availability || "",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const onSubmit = (data: any) => {
    updateUser.mutate({ id: user.id, data }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <FormControl><Input placeholder="e.g. Weekends, Evenings" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
