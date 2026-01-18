import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  MessageSquare, 
  Repeat, 
  Search 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/explore", label: "Explore Skills", icon: Search },
    { href: "/requests", label: "Requests", icon: Repeat },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SkillSwap
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={location === link.href ? "secondary" : "ghost"}
                    className={cn(
                      "gap-2 font-medium transition-all duration-200",
                      location === link.href && "bg-secondary/80 shadow-sm"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              <div className="h-6 w-px bg-border mx-2" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-border/50 shadow-xl">
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">{user.username}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/profile/${user.id}`}>
                    <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer rounded-lg focus:bg-destructive/5 focus:text-destructive"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-4">
              <Link href="/auth">
                <Button variant="ghost" className="font-medium hover:bg-secondary/50">Log in</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button className="font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link href={`/profile/${user.id}`} onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 mb-2">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">View Profile</p>
                    </div>
                  </div>
                </Link>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full h-12 font-semibold">Log in</Button>
                </Link>
                <Link href="/auth?tab=register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-12 font-bold shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
