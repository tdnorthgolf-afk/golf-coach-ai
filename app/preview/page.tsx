'use client'

import { useState } from 'react'
import { 
  Users, 
  FileText, 
  Calendar, 
  CalendarDays, 
  TrendingUp, 
  DollarSign,
  ChevronRight,
  LogOut,
  Target,
  Award,
  BarChart3,
  Clock,
  User,
  Settings,
  Menu
} from 'lucide-react'

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C'>('A')

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Tab Selector */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Design Comparison</h1>
          <p className="text-slate-400 mb-6">Choose the style that best fits your vision</p>
          
          <div className="inline-flex gap-2 p-1 rounded-xl bg-slate-800">
            <button
              onClick={() => setActiveTab('A')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'A' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Option A: No Icons
            </button>
            <button
              onClick={() => setActiveTab('B')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'B' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Option B: Line Icons
            </button>
            <button
              onClick={() => setActiveTab('C')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'C' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Option C: Monogram + Icons
            </button>
          </div>
        </div>

        {/* Option A: No Icons */}
        {activeTab === 'A' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-emerald-400 text-sm font-medium uppercase tracking-widest">Clean & Minimal</span>
              <h2 className="text-xl text-white mt-2">Typography-Driven Luxury Design</h2>
            </div>

            {/* Header Preview A */}
            <div 
              className="rounded-xl overflow-hidden border border-slate-700/50"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2035 100%)' }}
            >
              <header className="border-b border-slate-700/50 px-6 py-4" style={{ backgroundColor: 'rgba(15, 32, 53, 0.9)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                      style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)', color: '#0a1628' }}
                    >
                      G
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white tracking-tight">GOLF COACH</h1>
                      <p className="text-xs font-medium tracking-widest" style={{ color: '#d4af37' }}>ELITE PERFORMANCE</p>
                    </div>
                  </div>

                  <nav className="flex items-center gap-6">
                    <a href="#" className="text-slate-300 hover:text-white text-sm font-medium tracking-wide transition-colors">Calendar</a>
                    <a href="#" className="text-slate-300 hover:text-white text-sm font-medium tracking-wide transition-colors">Revenue</a>
                    <a href="#" className="text-slate-300 hover:text-white text-sm font-medium tracking-wide transition-colors">Settings</a>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium tracking-wide transition-colors">Sign Out</button>
                  </nav>
                </div>
              </header>

              {/* Stats Preview A */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl p-6 border border-slate-700/30" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">Students</p>
                  <p className="text-4xl font-light text-white">12</p>
                  <p className="text-emerald-400 text-sm mt-3 font-medium">Active Roster</p>
                </div>
                <div className="rounded-xl p-6 border border-slate-700/30" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">This Week</p>
                  <p className="text-4xl font-light text-white">8</p>
                  <p className="text-sm mt-3 font-medium" style={{ color: '#d4af37' }}>Lessons Completed</p>
                </div>
                <div className="rounded-xl p-6 border border-slate-700/30" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">Upcoming</p>
                  <p className="text-4xl font-light text-white">5</p>
                  <p className="text-sm mt-3 font-medium" style={{ color: '#d4af37' }}>Sessions Scheduled</p>
                </div>
              </div>

              {/* Student List Preview A */}
              <div className="px-6 pb-6">
                <div className="rounded-xl border border-slate-700/30 p-6" style={{ background: 'rgba(26, 58, 82, 0.2)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white tracking-tight">Your Students</h2>
                      <div className="h-0.5 w-12 mt-2" style={{ background: 'linear-gradient(90deg, #d4af37 0%, transparent 100%)' }}></div>
                    </div>
                    <button 
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)', color: '#0a1628' }}
                    >
                      Add Student
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {['John Mitchell', 'Sarah Chen', 'Mike Williams'].map((name, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 hover:border-amber-500/30 transition-all cursor-pointer group"
                        style={{ background: 'rgba(26, 58, 82, 0.3)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                            style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
                          >
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-amber-400 transition-colors">{name}</p>
                            <p className="text-slate-500 text-sm">Last lesson: 2 days ago</p>
                          </div>
                        </div>
                        <span className="text-slate-600 group-hover:text-amber-400 transition-colors">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Option B: Premium Line Icons */}
        {activeTab === 'B' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-emerald-400 text-sm font-medium uppercase tracking-widest">Modern & Professional</span>
              <h2 className="text-xl text-white mt-2">Clean Line Icons Throughout</h2>
            </div>

            {/* Header Preview B */}
            <div 
              className="rounded-xl overflow-hidden border border-slate-700/50"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2035 100%)' }}
            >
              <header className="border-b border-slate-700/50 px-6 py-4" style={{ backgroundColor: 'rgba(15, 32, 53, 0.9)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)' }}
                    >
                      <Target className="w-5 h-5" style={{ color: '#0a1628' }} />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white">Golf Coach AI</h1>
                      <p className="text-xs font-medium" style={{ color: '#d4af37' }}>Elite Performance</p>
                    </div>
                  </div>

                  <nav className="flex items-center gap-2">
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-medium transition-all">
                      <CalendarDays className="w-4 h-4" />
                      <span>Calendar</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-medium transition-all">
                      <TrendingUp className="w-4 h-4" />
                      <span>Revenue</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-medium transition-all">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </a>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </div>
              </header>

              {/* Stats Preview B */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl p-6 border border-slate-700/30 relative overflow-hidden" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Students</p>
                      <p className="text-4xl font-bold text-white mt-1">12</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/30">
                    <span className="text-emerald-400 text-sm font-medium">Active roster</span>
                  </div>
                </div>
                <div className="rounded-xl p-6 border border-slate-700/30 relative overflow-hidden" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">This Week</p>
                      <p className="text-4xl font-bold text-white mt-1">8</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                      <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/30">
                    <span className="text-sm font-medium" style={{ color: '#d4af37' }}>Lessons completed</span>
                  </div>
                </div>
                <div className="rounded-xl p-6 border border-slate-700/30 relative overflow-hidden" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Upcoming</p>
                      <p className="text-4xl font-bold text-white mt-1">5</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                      <Calendar className="w-6 h-6" style={{ color: '#d4af37' }} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/30">
                    <span className="text-sm font-medium" style={{ color: '#d4af37' }}>Sessions scheduled</span>
                  </div>
                </div>
              </div>

              {/* Student List Preview B */}
              <div className="px-6 pb-6">
                <div className="rounded-xl border border-slate-700/30 p-6" style={{ background: 'rgba(26, 58, 82, 0.2)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Your Students</h2>
                      <div className="h-0.5 w-12 mt-2" style={{ background: 'linear-gradient(90deg, #d4af37 0%, transparent 100%)' }}></div>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)', color: '#0a1628' }}
                    >
                      <User className="w-4 h-4" />
                      Add Student
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {['John Mitchell', 'Sarah Chen', 'Mike Williams'].map((name, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 hover:border-amber-500/30 transition-all cursor-pointer group"
                        style={{ background: 'rgba(26, 58, 82, 0.3)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(212, 175, 55, 0.15)' }}
                          >
                            <User className="w-5 h-5" style={{ color: '#d4af37' }} />
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-amber-400 transition-colors">{name}</p>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Last lesson: 2 days ago
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Option C: Monogram + Selective Icons */}
        {activeTab === 'C' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-emerald-400 text-sm font-medium uppercase tracking-widest">Balanced & Premium</span>
              <h2 className="text-xl text-white mt-2">Signature Monogram + Subtle Icons</h2>
            </div>

            {/* Header Preview C */}
            <div 
              className="rounded-xl overflow-hidden border border-slate-700/50"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2035 100%)' }}
            >
              <header className="border-b border-slate-700/50 px-6 py-4" style={{ backgroundColor: 'rgba(15, 32, 53, 0.9)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-2xl font-bold italic"
                      style={{ 
                        background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)', 
                        color: '#0a1628',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
                      }}
                    >
                      G
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white">Golf Coach</h1>
                      <p className="text-xs font-medium tracking-wider" style={{ color: '#d4af37' }}>PERFORMANCE LAB</p>
                    </div>
                  </div>

                  <nav className="flex items-center gap-1">
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-medium transition-all">
                      <CalendarDays className="w-4 h-4" />
                      <span>Calendar</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-medium transition-all">
                      <BarChart3 className="w-4 h-4" />
                      <span>Revenue</span>
                    </a>
                    <div className="w-px h-6 bg-slate-700 mx-2"></div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </nav>
                </div>
              </header>

              {/* Stats Preview C */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl p-6 border border-slate-700/30 relative overflow-hidden" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Students</p>
                  <p className="text-4xl font-bold text-white mt-2">12</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-emerald-400 text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="rounded-xl p-6 border border-slate-700/30 relative overflow-hidden" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">This Week</p>
                  <p className="text-4xl font-bold text-white mt-2">8</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/30">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">+3 from last week</span>
                  </div>
                </div>
                <div className="rounded-xl p-6 border border-slate-700/30 relative overflow-hidden" style={{ background: 'rgba(26, 58, 82, 0.3)' }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Upcoming</p>
                  <p className="text-4xl font-bold text-white mt-2">5</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/30">
                    <Clock className="w-4 h-4" style={{ color: '#d4af37' }} />
                    <span className="text-sm font-medium" style={{ color: '#d4af37' }}>Next: Tomorrow 9am</span>
                  </div>
                </div>
              </div>

              {/* Student List Preview C */}
              <div className="px-6 pb-6">
                <div className="rounded-xl border border-slate-700/30 p-6" style={{ background: 'rgba(26, 58, 82, 0.2)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Your Students</h2>
                      <div className="h-0.5 w-12 mt-2" style={{ background: 'linear-gradient(90deg, #d4af37 0%, transparent 100%)' }}></div>
                    </div>
                    <button 
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8960c 100%)', color: '#0a1628' }}
                    >
                      + Add Student
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'John Mitchell', handicap: '8.2', trend: 'up' },
                      { name: 'Sarah Chen', handicap: '12.5', trend: 'down' },
                      { name: 'Mike Williams', handicap: '15.1', trend: 'up' }
                    ].map((student, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 hover:border-amber-500/30 transition-all cursor-pointer group"
                        style={{ background: 'rgba(26, 58, 82, 0.3)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
                          >
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-amber-400 transition-colors">{student.name}</p>
                            <p className="text-slate-500 text-sm">Handicap: {student.handicap}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 text-sm ${student.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                            <Award className="w-4 h-4" />
                            <span>Improving</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selection Prompt */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 mb-4">Which design style do you prefer?</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => alert('Option A selected! Let me know and I\'ll apply this design.')}
              className="px-6 py-3 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Choose A
            </button>
            <button 
              onClick={() => alert('Option B selected! Let me know and I\'ll apply this design.')}
              className="px-6 py-3 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Choose B
            </button>
            <button 
              onClick={() => alert('Option C selected! Let me know and I\'ll apply this design.')}
              className="px-6 py-3 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Choose C
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}