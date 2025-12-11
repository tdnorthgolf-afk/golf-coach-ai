import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { 
  Target, 
  BarChart3, 
  Calendar, 
  Users, 
  Mic, 
  Video,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A1A20]">
      {/* Header */}
      <header className="border-b border-[#D6C8B4]/10 bg-[#002D40]/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-2xl font-bold italic bg-[#E65722] text-white shadow-lg shadow-[#E65722]/40">
                G
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Golf Coach</h1>
                <p className="text-xs font-medium tracking-widest text-[#E65722]">PERFORMANCE LAB</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/student-portal"
                className="text-[#E8E3DC] hover:text-white text-sm font-medium transition-colors"
              >
                Student Portal
              </Link>
              <Link
                href="/sign-in"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90"
              >
                Coach Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E65722]/10 border border-[#E65722]/20 text-[#E65722] text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Golf Coaching Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#E8E3DC] leading-tight mb-6">
              Elevate Your
              <span className="text-[#E65722]"> Coaching </span>
              Experience
            </h1>
            <p className="text-xl text-[#5F9EA0] mb-8 leading-relaxed">
              The premium platform for elite golf coaches. AI-powered lesson transcription, 
              strokes gained analytics, and seamless student management — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90 shadow-lg shadow-[#E65722]/25"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/student-portal"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all bg-[#002D40] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]"
              >
                I&apos;m a Student
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#E8E3DC] mb-4">
              Everything You Need to Coach
              <span className="text-[#E65722]"> Champions</span>
            </h2>
            <p className="text-lg text-[#5F9EA0] max-w-2xl mx-auto">
              Built for serious coaches who demand excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl p-8 bg-[#002D40] border border-[#D6C8B4]/10 hover:border-[#E65722]/30 transition-all group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#E65722]/15 mb-6 group-hover:bg-[#E65722]/25 transition-colors">
                <Mic className="w-7 h-7 text-[#E65722]" />
              </div>
              <h3 className="text-xl font-bold text-[#E8E3DC] mb-3">AI Lesson Transcription</h3>
              <p className="text-[#5F9EA0]">
                Record lessons and let AI transcribe and summarize key points automatically. 
                Never miss an important coaching moment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl p-8 bg-[#002D40] border border-[#D6C8B4]/10 hover:border-[#E65722]/30 transition-all group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#E65722]/15 mb-6 group-hover:bg-[#E65722]/25 transition-colors">
                <BarChart3 className="w-7 h-7 text-[#E65722]" />
              </div>
              <h3 className="text-xl font-bold text-[#E8E3DC] mb-3">Strokes Gained Analytics</h3>
              <p className="text-[#5F9EA0]">
                Track performance with PGA Tour-level strokes gained metrics. 
                Identify weaknesses and measure improvement over time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl p-8 bg-[#002D40] border border-[#D6C8B4]/10 hover:border-[#E65722]/30 transition-all group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#E65722]/15 mb-6 group-hover:bg-[#E65722]/25 transition-colors">
                <Target className="w-7 h-7 text-[#E65722]" />
              </div>
              <h3 className="text-xl font-bold text-[#E8E3DC] mb-3">Visual Shot Tracking</h3>
              <p className="text-[#5F9EA0]">
                Plot shots on satellite imagery for detailed analysis. 
                Visualize patterns and optimize course strategy.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl p-8 bg-[#002D40] border border-[#D6C8B4]/10 hover:border-[#E65722]/30 transition-all group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#E65722]/15 mb-6 group-hover:bg-[#E65722]/25 transition-colors">
                <Users className="w-7 h-7 text-[#E65722]" />
              </div>
              <h3 className="text-xl font-bold text-[#E8E3DC] mb-3">Student Management</h3>
              <p className="text-[#5F9EA0]">
                Organize your roster, track progress, and maintain detailed records 
                for each student in one central location.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl p-8 bg-[#002D40] border border-[#D6C8B4]/10 hover:border-[#E65722]/30 transition-all group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#E65722]/15 mb-6 group-hover:bg-[#E65722]/25 transition-colors">
                <Calendar className="w-7 h-7 text-[#E65722]" />
              </div>
              <h3 className="text-xl font-bold text-[#E8E3DC] mb-3">Booking & Payments</h3>
              <p className="text-[#5F9EA0]">
                Integrated scheduling and Stripe payments. Students book and pay online, 
                you focus on coaching.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl p-8 bg-[#002D40] border border-[#D6C8B4]/10 hover:border-[#E65722]/30 transition-all group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#E65722]/15 mb-6 group-hover:bg-[#E65722]/25 transition-colors">
                <Video className="w-7 h-7 text-[#E65722]" />
              </div>
              <h3 className="text-xl font-bold text-[#E8E3DC] mb-3">Media Library</h3>
              <p className="text-[#5F9EA0]">
                Store and organize swing videos, photos, and audio recordings. 
                Students access their media through their portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-[#002D40]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-6 h-6 fill-[#E65722] text-[#E65722]" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium text-[#E8E3DC] text-center max-w-4xl mx-auto mb-8">
            &ldquo;This platform has transformed how I coach. The strokes gained analytics 
            alone have helped my students drop an average of 3 strokes in just two months.&rdquo;
          </blockquote>
          <div className="text-center">
            <p className="text-[#E65722] font-semibold">Mike Richardson</p>
            <p className="text-[#5F9EA0]">PGA Professional, Pebble Beach Golf Academy</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#E8E3DC] mb-4">
            Ready to Elevate Your Coaching?
          </h2>
          <p className="text-lg text-[#5F9EA0] mb-8">
            Join elite coaches who are transforming their practice with AI-powered tools.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-xl font-semibold transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90 shadow-lg shadow-[#E65722]/25"
          >
            Get Started Free
            <ChevronRight className="w-6 h-6" />
          </Link>
          <p className="text-sm text-[#5F9EA0] mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D6C8B4]/10 py-12 px-6 bg-[#002D40]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-serif text-xl font-bold italic bg-[#E65722] text-white">
                G
              </div>
              <div>
                <p className="font-bold text-white">Golf Coach</p>
                <p className="text-xs text-[#5F9EA0]">Performance Lab</p>
              </div>
            </div>
            <p className="text-[#5F9EA0] text-sm">
              © 2024 Golf Coach AI. Built for champions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}