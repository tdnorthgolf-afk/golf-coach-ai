'use client'

import { useState, useRef } from 'react'
import { Target, RotateCcw, Flag, Circle } from 'lucide-react'
import { calculateStrokesGained, ShotData, StrokesGainedSummary, LieType, formatStrokesGained, getStrokesGainedColor } from '@/lib/strokes-gained'

interface ShotTrackerProps {
  imageUrl: string
  holeYardage: number
  par: number
  onSave?: (shots: ShotData[], summary: StrokesGainedSummary) => void
}

type PlacementMode = 'tee' | 'pin' | 'shot_start' | 'shot_end'

interface Position {
  x: number
  y: number
}

export default function ShotTracker({ imageUrl, holeYardage, par, onSave }: ShotTrackerProps) {
  const [mode, setMode] = useState<PlacementMode>('tee')
  const [teePosition, setTeePosition] = useState<Position | null>(null)
  const [pinPosition, setPinPosition] = useState<Position | null>(null)
  const [shots, setShots] = useState<ShotData[]>([])
  const [currentShot, setCurrentShot] = useState<Partial<ShotData>>({})
  const [selectedClub, setSelectedClub] = useState('Driver')
  const [selectedLie, setSelectedLie] = useState<LieType>('tee')
  const [isPenalty, setIsPenalty] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const clubs = ['Driver', '3 Wood', '5 Wood', '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron', 'PW', 'GW', 'SW', 'LW', 'Putter']
  const lies: LieType[] = ['tee', 'fairway', 'rough', 'bunker', 'green', 'fringe', 'recovery']

  const pixelsToYards = (pixels: number): number => {
    if (!teePosition || !pinPosition) return 0
    const teeToPin = Math.sqrt(
      Math.pow(pinPosition.x - teePosition.x, 2) + Math.pow(pinPosition.y - teePosition.y, 2)
    )
    return (pixels / teeToPin) * holeYardage
  }

  const getDistanceToPin = (pos: Position): number => {
    if (!pinPosition) return 0
    const pixels = Math.sqrt(
      Math.pow(pinPosition.x - pos.x, 2) + Math.pow(pinPosition.y - pos.y, 2)
    )
    return pixelsToYards(pixels)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const pos = { x, y }

    switch (mode) {
      case 'tee':
        setTeePosition(pos)
        setMode('pin')
        break
      case 'pin':
        setPinPosition(pos)
        setMode('shot_start')
        break
      case 'shot_start':
        setCurrentShot({
          startPosition: pos,
          startLie: selectedLie,
          startDistanceYards: getDistanceToPin(pos),
          club: selectedClub,
        })
        setMode('shot_end')
        break
      case 'shot_end':
        const endDistance = getDistanceToPin(pos)
        const newShot: ShotData = {
          shotNumber: shots.length + 1,
          startPosition: currentShot.startPosition!,
          endPosition: pos,
          startLie: currentShot.startLie as LieType,
          endLie: endDistance < 1 ? 'green' : selectedLie,
          startDistanceYards: currentShot.startDistanceYards!,
          endDistanceYards: endDistance,
          club: currentShot.club!,
          isPenalty,
          penaltyStrokes: isPenalty ? 1 : 0,
        }
        setShots([...shots, newShot])
        setCurrentShot({})
        setIsPenalty(false)
        
        if (endDistance < 1) {
          // Holed out
          setMode('shot_start')
        } else {
          setSelectedLie(endDistance < 5 ? 'green' : 'fairway')
          setMode('shot_start')
        }
        break
    }
  }

  const resetTracker = () => {
    setTeePosition(null)
    setPinPosition(null)
    setShots([])
    setCurrentShot({})
    setMode('tee')
    setSelectedLie('tee')
  }

  const summary = shots.length > 0 ? calculateStrokesGained(shots) : null

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[#002D40]">
        <div className="flex-1">
          <p className="text-sm text-[#5F9EA0] mb-1">Current Step</p>
          <p className="text-[#E8E3DC] font-medium">
            {mode === 'tee' && '📍 Click to place tee position'}
            {mode === 'pin' && '🚩 Click to place pin position'}
            {mode === 'shot_start' && '🎯 Click shot starting position'}
            {mode === 'shot_end' && '⛳ Click where the ball landed'}
          </p>
        </div>
        <button
          onClick={resetTracker}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#D6C8B4]/20 text-[#E8E3DC] hover:bg-[#D6C8B4]/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Club & Lie Selection */}
      {(mode === 'shot_start' || mode === 'shot_end') && (
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#002D40]">
          <div>
            <label className="block text-sm text-[#5F9EA0] mb-2">Club</label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722]"
            >
              {clubs.map(club => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#5F9EA0] mb-2">Lie</label>
            <select
              value={selectedLie}
              onChange={(e) => setSelectedLie(e.target.value as LieType)}
              className="w-full px-3 py-2 rounded-lg border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722]"
            >
              {lies.map(lie => (
                <option key={lie} value={lie}>{lie.charAt(0).toUpperCase() + lie.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPenalty}
                onChange={(e) => setIsPenalty(e.target.checked)}
                className="w-4 h-4 rounded border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E65722] focus:ring-[#E65722]"
              />
              <span className="text-sm text-[#E8E3DC]">Penalty stroke</span>
            </label>
          </div>
        </div>
      )}

      {/* Image with Shot Overlay */}
      <div
        ref={imageRef}
        onClick={handleImageClick}
        className="relative w-full aspect-video rounded-xl overflow-hidden cursor-crosshair border border-[#D6C8B4]/20"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Tee Position */}
        {teePosition && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-[#002D40] border-2 border-[#E8E3DC] flex items-center justify-center"
            style={{ left: `${teePosition.x}%`, top: `${teePosition.y}%` }}
          >
            <Circle className="w-3 h-3 text-[#E8E3DC]" />
          </div>
        )}

        {/* Pin Position */}
        {pinPosition && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-6"
            style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
          >
            <Flag className="w-6 h-6 text-[#E65722]" />
          </div>
        )}

        {/* Shot Lines and Markers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {shots.map((shot, i) => (
            <g key={i}>
              <line
                x1={`${shot.startPosition.x}%`}
                y1={`${shot.startPosition.y}%`}
                x2={`${shot.endPosition.x}%`}
                y2={`${shot.endPosition.y}%`}
                stroke="#E65722"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <circle
                cx={`${shot.endPosition.x}%`}
                cy={`${shot.endPosition.y}%`}
                r="8"
                fill="#E65722"
                stroke="#E8E3DC"
                strokeWidth="2"
              />
              <text
                x={`${shot.endPosition.x}%`}
                y={`${shot.endPosition.y}%`}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#E8E3DC"
                fontSize="10"
                fontWeight="bold"
              >
                {shot.shotNumber}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Shot List */}
      {shots.length > 0 && (
        <div className="rounded-xl p-4 bg-[#002D40]">
          <h3 className="text-lg font-semibold text-[#E8E3DC] mb-4">Shot Breakdown</h3>
          <div className="space-y-2">
            {shots.map((shot, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0A1A20] border border-[#D6C8B4]/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E65722] flex items-center justify-center text-white text-sm font-bold">
                    {shot.shotNumber}
                  </div>
                  <div>
                    <p className="text-[#E8E3DC] font-medium">{shot.club}</p>
                    <p className="text-sm text-[#5F9EA0]">
                      {Math.round(shot.startDistanceYards)}y → {Math.round(shot.endDistanceYards)}y
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#5F9EA0]">{shot.startLie}</p>
                  {shot.isPenalty && <span className="text-xs text-[#D94F3A]">+1 penalty</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strokes Gained Summary */}
      {summary && (
        <div className="rounded-xl p-4 bg-[#002D40]">
          <h3 className="text-lg font-semibold text-[#E8E3DC] mb-4">Strokes Gained</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-[#0A1A20] text-center">
              <p className="text-xs text-[#5F9EA0] mb-1">Off Tee</p>
              <p className={`text-lg font-bold ${summary.sgOffTee >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                {summary.sgOffTee >= 0 ? '+' : ''}{summary.sgOffTee.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A1A20] text-center">
              <p className="text-xs text-[#5F9EA0] mb-1">Approach</p>
              <p className={`text-lg font-bold ${summary.sgApproach >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                {summary.sgApproach >= 0 ? '+' : ''}{summary.sgApproach.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A1A20] text-center">
              <p className="text-xs text-[#5F9EA0] mb-1">Around Green</p>
              <p className={`text-lg font-bold ${summary.sgAroundGreen >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                {summary.sgAroundGreen >= 0 ? '+' : ''}{summary.sgAroundGreen.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A1A20] text-center">
              <p className="text-xs text-[#5F9EA0] mb-1">Putting</p>
              <p className={`text-lg font-bold ${summary.sgPutting >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                {summary.sgPutting >= 0 ? '+' : ''}{summary.sgPutting.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#D6C8B4] text-center">
              <p className="text-xs text-[#5F9EA0] mb-1">Total</p>
              <p className={`text-lg font-bold ${summary.sgTotal >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                {summary.sgTotal >= 0 ? '+' : ''}{summary.sgTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}