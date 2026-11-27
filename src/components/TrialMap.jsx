import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cityCoords } from '../trials.js'

const DEFAULT_CENTER = [33.43, -111.94]
const MERGE_PX = 48 // bubbles closer than this on screen are merged

const bubble = (count, { selected = false, cluster = false } = {}) => {
  const size = cluster ? 46 : 40
  return L.divIcon({
    className: '',
    html: `<span class="map-bubble${selected ? ' is-selected' : ''}${cluster ? ' is-cluster' : ''}">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 12), { duration: 0.6 })
  }, [target, map])
  return null
}

function FitAll({ points }) {
  const map = useMap()
  const key = points.map((p) => p.join()).join('|')
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [60, 60], maxZoom: 12 })
    else if (points.length === 1) map.setView(points[0], 12)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

// Groups city bubbles that would overlap at the current zoom level.
function Bubbles({ groups, selectedCity, onSelectCity }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  const clusters = useMemo(() => {
    const out = []
    for (const g of groups) {
      const pt = map.project(g.pos, zoom)
      const hit = out.find((c) => c.pt.distanceTo(pt) < MERGE_PX)
      if (hit) {
        hit.members.push(g)
        hit.count += g.count
      } else {
        out.push({ pt, members: [g], count: g.count })
      }
    }
    return out.map((c) => {
      const lat = c.members.reduce((s, m) => s + m.pos[0], 0) / c.members.length
      const lng = c.members.reduce((s, m) => s + m.pos[1], 0) / c.members.length
      return { ...c, pos: [lat, lng] }
    })
  }, [groups, zoom, map])

  return clusters.map((c) => {
    const single = c.members.length === 1
    const city = c.members[0].city
    const label = single
      ? `${c.count} ${c.count === 1 ? 'trial' : 'trials'} in ${city}`
      : `${c.count} trials in ${c.members.map((m) => m.city).join(', ')}. Click to zoom in.`
    return (
      <Marker
        key={c.members.map((m) => m.city).join('|')}
        position={c.pos}
        icon={bubble(c.count, { selected: single && city === selectedCity, cluster: !single })}
        title={label}
        alt={label}
        keyboard
        eventHandlers={{
          click: () => {
            if (single) onSelectCity(city)
            else map.flyToBounds(c.members.map((m) => m.pos), { padding: [80, 80], maxZoom: 13, duration: 0.6 })
          },
        }}
      />
    )
  })
}

export default function TrialMap({ trials, selectedCity, onSelectCity, center }) {
  const groups = useMemo(() => {
    const m = new Map()
    for (const t of trials) {
      if (!cityCoords[t.city]) continue
      m.set(t.city, (m.get(t.city) || 0) + 1)
    }
    return [...m.entries()].map(([city, count]) => ({ city, count, pos: cityCoords[city] }))
  }, [trials])

  return (
    <MapContainer center={center || DEFAULT_CENTER} zoom={11} scrollWheelZoom className="h-full w-full" attributionControl>
      <TileLayer
        // Free OpenStreetMap tiles (no API key). Fine for development and light use;
        // switch to a hosted provider before high-traffic production use.
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="map-tiles-muted"
      />
      <FitAll points={groups.map((g) => g.pos)} />
      <FlyTo target={selectedCity ? cityCoords[selectedCity] : null} />
      <Bubbles groups={groups} selectedCity={selectedCity} onSelectCity={onSelectCity} />
    </MapContainer>
  )
}
