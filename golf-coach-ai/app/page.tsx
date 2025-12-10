import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GolfIcon, MicIcon, ImageIcon, FileTextIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-golf">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="animate-fade-in">
            <GolfIcon className="w-20 h-20 mx-auto mb-4 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 text-shadow">
              Golf Coach AI
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Professional golf instruction management powered by AI
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 my-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <MicIcon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Lesson Notes</h3>
              <p className="text-sm text-white/80">
                Record lessons and get professionally formatted notes instantly
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <ImageIcon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Media Management</h3>
              <p className="text-sm text-white/80">
                Store photos, videos, and documents for each student
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <FileTextIcon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Training Spaces</h3>
              <p className="text-sm text-white/80">
                Organized chronological feed for every student
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link href="/sign-in">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-course hover:bg-white/90">
                Get Started
              </Button>
            </Link>
            <p className="text-sm text-white/70">
              Free to start • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
