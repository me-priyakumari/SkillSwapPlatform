import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Palette, Languages, Music } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-secondary/50 border border-secondary text-sm font-medium text-primary animate-fade-in-up">
            🚀 The #1 Skill Exchange Community
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in-up [animation-delay:100ms]">
            Teach what you know. <br />
            <span className="text-primary">Learn what you don't.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up [animation-delay:200ms]">
            Connect with experts in coding, design, languages, and more. Exchange your skills for theirs—completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:300ms]">
            <Link href="/explore">
              <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                Explore Skills
              </Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-lg rounded-xl border-2 hover:bg-secondary/50 transition-all">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SkillSwap?</h2>
            <p className="text-lg text-muted-foreground">We believe knowledge should be shared, not just bought. Here's how we make it easy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="h-8 w-8 text-blue-500" />}
              title="Tech & Coding"
              description="Master React, Python, or Go with help from experienced developers."
            />
            <FeatureCard 
              icon={<Palette className="h-8 w-8 text-pink-500" />}
              title="Creative Arts"
              description="Learn UI Design, photography, or music production from creative pros."
            />
            <FeatureCard 
              icon={<Languages className="h-8 w-8 text-green-500" />}
              title="Languages"
              description="Practice conversation with native speakers in exchange for your skills."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Success Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="I taught Spanish and learned React. Now I'm a frontend dev at a startup!"
              author="Elena Rodriguez"
              role="Frontend Developer"
            />
            <TestimonialCard 
              quote="Found a guitar teacher who wanted to learn SEO. Perfect match."
              author="Mark Thompson"
              role="Digital Marketer"
            />
            <TestimonialCard 
              quote="The community is so supportive. It's not just transactional, it's about growth."
              author="Sarah Chen"
              role="UX Designer"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
             <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">S</div>
             <p className="font-bold text-xl">SkillSwap</p>
          </div>
          <div className="flex justify-center gap-8 mb-8 text-muted-foreground">
            <a href="#" className="hover:text-primary">About</a>
            <a href="#" className="hover:text-primary">Blog</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Privacy</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 SkillSwap Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-background border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 p-3 bg-secondary rounded-xl w-fit">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-card border border-border shadow-sm">
      <div className="flex gap-1 text-yellow-400 mb-4">
        {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
      </div>
      <p className="text-lg mb-6 leading-relaxed">"{quote}"</p>
      <div>
        <p className="font-bold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
