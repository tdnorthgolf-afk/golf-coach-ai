'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ShotData,
  LieType,
  calculateStrokesGained,
  calculateDistance,
  calibrateScale,
  formatStrokesGained,
  getStrokesGainedColor,
  CATEGORY_NAMES,
  CATEGORY_COLORS,
  ShotCategory
} from '@/lib/strokes-gained'

interface ShotTrackerProps {
  imageUrl: string
  holeNumber: number
  par: number
  yardage: number
  teePosition?: { x: number; y: number }
  pinPosition?: { x: number; y: number }
  onSave?: (shots: ShotData[], summary: any) => void
}

type PlacementMode = 'tee' | 'pin' | 'shot_start' | 'shot_end' | null

const CLUBS = [
  'Driver', '3 Wood', '5 Wood',
  '3 Hybrid', '4 Hybrid', '5 Hybrid',
  '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron',
  'PW', 'GW', 'SW', 'LW',
  'Putter'
]

const LIE_OPTIONS: { value: LieType; label: string }[] = [
  { value: 'tee', label: 'Tee' },
  { value: 'fairway', label: 'Fairway' },
  { value: 'rough', label: 'Rough' },
  { value: 'bunker', label: 'Bunker' },
  { value: 'green', label: 'Green' },
  { value: 'fringe', label: 'Fringe' },
  { value: 'recovery', label: 'Recovery' },
]

export default function ShotTracker({
  imageUrl,
  holeNumber,
  par,
  yardage,
  teePosition: initialTee,
  pinPosition: initialPin,
  onSave
}: ShotTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [teePos, setTeePos] = useState(initialTee || null)
  const [pinPos, setPinPos] = useState(initialPin || null)
  const [shots, setShots] = useState<ShotData[]>([])
  const [currentShot, setCurrentShot] = useState<Partial<ShotData>>({})
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null)
  const [pixelsPerYard, setPixelsPerYard] = useState<number | null>(null)
  const [selectedClub, setSelectedClub] = useState('Driver')
  const [selectedLie, setSelectedLie] = useState<LieType>('tee')
  const [isPenalty, setIsPenalty] = useState(false)

  // Calculate scale when tee and pin are set
  useEffect(() => {
    if (teePos && pinPos) {
      const scale = calibrateScale(teePos, pinPos, yardage)
      setPixelsPerYard(scale)
    }
  }, [teePos, pinPos, yardage])

  // Handle image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
  }

  // Handle click on image
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = imageSize.width / rect.width
    const scaleY = imageSize.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const position = { x: Math.round(x), y: Math.round(y) }

    switch (placementMode) {
      case 'tee':
        setTeePos(position)
        setPlacementMode(null)
        break
      case 'pin':
        setPinPos(position)
        setPlacementMode(null)
        break
      case 'shot_start':
        setCurrentShot({
          ...currentShot,
          startPosition: position,
          startLie: selectedLie
        })
        setPlacementMode('shot_end')
        break
      case 'shot_end':
        if (currentShot.startPosition && pinPos && pixelsPerYard) {
          const startDist = calculateDistance(currentShot.startPosition, pinPos, pixelsPerYard)
          const endDist = calculateDistance(position, pinPos, pixelsPerYard)
          
          const newShot: ShotData = {
            shotNumber: shots.length + 1,
            startPosition: currentShot.startPosition,
            endPosition: position,
            startLie: currentShot.startLie || 'fairway',
            endLie: selectedLie,
            startDistanceYards: Math.round(startDist * 10) / 10,
            endDistanceYards: Math.round(endDist * 10) / 10,
            club: selectedClub,
            isPenalty,
            penaltyStrokes: isPenalty ? 1 : 0
          }
          
          setShots([...shots, newShot])
setCurrentShot({})
setIsPenalty(false)

// Auto-prepare for next shot from where this one ended
if (endDist > 0.5) {
  // Not holed yet - prepare for next shot
  setCurrentShot({
    startPosition: position,
    startLie: selectedLie
  })
  setPlacementMode('shot_end')
  
  // Update lie for next shot
  if (selectedLie === 'green') {
    setSelectedLie('green')
    setSelectedClub('Putter')
  } else if (endDist < 50) {
    setSelectedLie('green')
    setSelectedClub('Putter')
  }
} else {
  // Holed! Stop tracking
  setPlacementMode(null)
  alert('🎉 Holed! Great shot!')
}
          
          // Auto-set next lie based on end position
          if (endDist < 1) {
            // Holed!
          } else if (selectedLie === 'green') {
            setSelectedLie('green')
          } else {
            setSelectedLie('fairway')
          }
        }
        break
    }
  }

  // Remove last shot
  const removeLastShot = () => {
    setShots(shots.slice(0, -1))
  }

  // Clear all shots
  const clearShots = () => {
    setShots([])
    setCurrentShot({})
    setPlacementMode(null)
  }

  // Calculate strokes gained
  const summary = shots.length > 0 ? calculateStrokesGained(shots) : null

  // Save handler
  const handleSave = () => {
    if (onSave && summary) {
      onSave(shots, summary)
    }
  }

  // Get marker style position
  const getMarkerStyle = (pos: { x: number; y: number }) => {
    if (!imageSize.width) return {}
    return {
      left: `${(pos.x / imageSize.width) * 100}%`,
      top: `${(pos.y / imageSize.height) * 100}%`
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Hole {holeNumber}</h2>
          <p className="text-slate-400 text-sm">Par {par} • {yardage} yards</p>
        </div>
        {summary && (
          <div className="text-right">
            <p className="text-slate-400 text-sm">Total SG</p>
            <p className={`text-xl font-bold ${getStrokesGainedColor(summary.total)}`}>
              {formatStrokesGained(summary.total)}
            </p>
          </div>
        )}
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative cursor-crosshair"
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt={`Hole ${holeNumber}`}
          className="w-full h-auto"
          onLoad={handleImageLoad}
        />

        {/* Tee Marker */}
        {teePos && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-3 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold z-10"
            style={getMarkerStyle(teePos)}
          >
            T
          </div>
        )}

        {/* Pin Marker */}
        {pinPos && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center z-10"
            style={getMarkerStyle(pinPos)}
          >
            🚩
          </div>
        )}

        {/* Shot Paths and Markers */}
        {shots.map((shot, idx) => {
          const category = summary?.shots[idx]?.category || 'approach'
          const color = CATEGORY_COLORS[category as ShotCategory]
          
          return (
            <div key={idx}>
              {/* Shot line (SVG overlay) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 5 }}
              >
                <line
                  x1={`${(shot.startPosition.x / imageSize.width) * 100}%`}
                  y1={`${(shot.startPosition.y / imageSize.height) * 100}%`}
                  x2={`${(shot.endPosition.x / imageSize.width) * 100}%`}
                  y2={`${(shot.endPosition.y / imageSize.height) * 100}%`}
                  stroke={color}
                  strokeWidth="3"
                  strokeOpacity="0.8"
                />
              </svg>
              
              {/* Start marker */}
              <div
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white z-10"
                style={{
                  ...getMarkerStyle(shot.startPosition),
                  backgroundColor: color
                }}
              >
                {shot.shotNumber}
              </div>
              
              {/* End marker (small dot) */}
              <div
                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border border-white z-10"
                style={{
                  ...getMarkerStyle(shot.endPosition),
                  backgroundColor: color
                }}
              />
            </div>
          )
        })}

        {/* Current shot start marker */}
        {currentShot.startPosition && placementMode === 'shot_end' && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-3 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white z-10 animate-pulse"
            style={getMarkerStyle(currentShot.startPosition)}
          >
            {shots.length + 1}
          </div>
        )}

        {/* Placement mode indicator */}
        {placementMode && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm z-20">
            {placementMode === 'tee' && 'Click to place TEE'}
            {placementMode === 'pin' && 'Click to place PIN'}
            {placementMode === 'shot_start' && 'Click shot START position'}
            {placementMode === 'shot_end' && 'Click shot END position'}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-slate-700 space-y-4">
        {/* Setup buttons (show if tee/pin not set) */}
        {(!teePos || !pinPos) && (
          <div className="flex gap-2">
            <button
              onClick={() => setPlacementMode('tee')}
              className={`flex-1 py-2 rounded-lg font-medium ${
                placementMode === 'tee' 
                  ? 'bg-yellow-500 text-black' 
                  : teePos 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-yellow-600 text-white'
              }`}
            >
              {teePos ? '✓ Tee Set' : 'Set Tee Position'}
            </button>
            <button
              onClick={() => setPlacementMode('pin')}
              className={`flex-1 py-2 rounded-lg font-medium ${
                placementMode === 'pin' 
                  ? 'bg-green-500 text-black' 
                  : pinPos 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-green-600 text-white'
              }`}
            >
              {pinPos ? '✓ Pin Set' : 'Set Pin Position'}
            </button>
          </div>
        )}

        {/* Shot entry controls (show when calibrated) */}
        {teePos && pinPos && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Club</label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm"
                >
                  {CLUBS.map(club => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">
                  {placementMode === 'shot_end' ? 'End Lie' : 'Start Lie'}
                </label>
                <select
                  value={selectedLie}
                  onChange={(e) => setSelectedLie(e.target.value as LieType)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm"
                >
                  {LIE_OPTIONS.map(lie => (
                    <option key={lie.value} value={lie.value}>{lie.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isPenalty}
                  onChange={(e) => setIsPenalty(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Penalty Stroke</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPlacementMode('shot_start')}
                disabled={placementMode !== null}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-2 rounded-lg font-medium"
              >
                + Add Shot
              </button>
              {shots.length > 0 && (
                <button
                  onClick={removeLastShot}
                  className="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                >
                  Undo
                </button>
              )}
            </div>
          </>
        )}

        {/* Cancel button when in placement mode */}
        {placementMode && (
          <button
            onClick={() => {
              setPlacementMode(null)
              setCurrentShot({})
            }}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Strokes Gained Summary */}
      {summary && summary.shots.length > 0 && (
        <div className="p-4 border-t border-slate-700">
          <h3 className="text-white font-medium mb-3">Strokes Gained Breakdown</h3>
          
          {/* Category breakdown */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(Object.keys(summary.byCategory) as ShotCategory[]).map(cat => (
              <div key={cat} className="bg-slate-700 rounded p-2 text-center">
                <p className="text-slate-400 text-xs">{CATEGORY_NAMES[cat]}</p>
                <p className={`font-bold ${getStrokesGainedColor(summary.byCategory[cat])}`}>
                  {formatStrokesGained(summary.byCategory[cat])}
                </p>
              </div>
            ))}
          </div>

          {/* Shot list */}
          <div className="space-y-2 mb-4">
            {summary.shots.map((shot, idx) => (
              <div key={idx} className="bg-slate-700 rounded p-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[shot.category] }}
                  >
                    {shot.shotNumber}
                  </span>
                  <span className="text-white">{shot.club}</span>
                  <span className="text-slate-400">
                    {shot.startDistanceYards}→{shot.endDistanceYards}yds
                  </span>
                </div>
                <span className={`font-medium ${getStrokesGainedColor(shot.strokesGained)}`}>
                  {formatStrokesGained(shot.strokesGained)}
                </span>
              </div>
            ))}
          </div>

          {/* Save button */}
          {onSave && (
            <button
              onClick={handleSave}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold"
            >
              Save Shot Data
            </button>
          )}
        </div>
      )}
    </div>
  )
}