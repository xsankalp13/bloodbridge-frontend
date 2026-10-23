import * as React from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { BloodBankFacility } from "@/data/bloodBanksData"
import type { GeoCoordinates } from "@/types"
import { Maximize2, LocateFixed } from "lucide-react"

interface BloodBanksMapProps {
  bloodBanks: BloodBankFacility[]
  userCoords: GeoCoordinates | null
  hospitalName?: string
  selectedBankId?: string | null
  onSelectBank?: (bank: BloodBankFacility) => void
  className?: string
}

export function BloodBanksMap({
  bloodBanks,
  userCoords,
  hospitalName,
  selectedBankId,
  onSelectBank,
  className = "",
}: BloodBanksMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null)
  const mapInstanceRef = React.useRef<L.Map | null>(null)
  const markersRef = React.useRef<Map<string, L.Marker>>(new Map())
  const userMarkerRef = React.useRef<L.Marker | null>(null)

  // Initialize Map
  React.useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    // Center coordinates: userCoords or the first blood bank or fallback to Karachi center
    const defaultCenter: [number, number] = userCoords
      ? [userCoords.lat, userCoords.lng]
      : bloodBanks.length > 0
        ? [bloodBanks[0].coordinates.lat, bloodBanks[0].coordinates.lng]
        : [24.8607, 67.0011]

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    })

    // OpenTopoMap tiles (100% free, no API key required)
    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      subdomains: "abc",
    }).addTo(map)

    // Add minimal zoom controls on bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, []) // mount once

  // Render & Update Markers
  React.useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    const bounds = L.latLngBounds([])

    // 1. Add User / Hospital Location Marker
    if (userCoords) {
      const userLatLng = L.latLng(userCoords.lat, userCoords.lng)
      bounds.extend(userLatLng)

      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(217, 45, 62, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background-color: #D92D3E; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(217, 45, 62, 0.45); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
      })

      const userMarker = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map)
      userMarker.bindPopup(`
        <div style="font-family: Inter, system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <div style="display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #D92D3E; margin-bottom: 2px;">
            Request Origin
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #172033; line-height: 1.2;">
            ${hospitalName || "Patient Hospital Location"}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 3px;">
            Urgent search radius calculated from here
          </div>
        </div>
      `)
      userMarkerRef.current = userMarker
    }

    // 2. Add Blood Bank Markers
    bloodBanks.forEach((bb) => {
      const latLng = L.latLng(bb.coordinates.lat, bb.coordinates.lng)
      bounds.extend(latLng)

      const isSelected = selectedBankId === bb.id

      const bbIcon = L.divIcon({
        className: "custom-bb-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 4px 8px;
              border-radius: 9999px;
              background-color: ${isSelected ? "#D92D3E" : "#172033"};
              color: #ffffff;
              font-family: Inter, sans-serif;
              font-size: 10px;
              font-weight: 700;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
              border: 2px solid #ffffff;
              white-space: nowrap;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 18h12"></path>
                <path d="M3 22h18"></path>
                <path d="M14 22a7 7 0 1 0-4 0"></path>
                <path d="M9 14h6"></path>
                <path d="M12 6v8"></path>
              </svg>
              <span>${bb.distanceKm !== undefined ? `${bb.distanceKm.toFixed(1)} km` : bb.name.slice(0, 14) + "..."}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${isSelected ? "#D92D3E" : "#172033"}; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [80, 36],
        iconAnchor: [40, 34],
        popupAnchor: [0, -34],
      })

      const marker = L.marker(latLng, { icon: bbIcon }).addTo(map)

      // Rich popup content
      const popupHtml = `
        <div style="font-family: Inter, system-ui, sans-serif; padding: 6px; min-width: 220px; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #D92D3E; background: rgba(217,45,62,0.1); padding: 2px 6px; border-radius: 9999px;">
              ${bb.city} · ${bb.distanceKm !== undefined ? `${bb.distanceKm.toFixed(1)} km` : "Nearby"}
            </span>
            <span style="font-size: 10px; color: #10B981; font-weight: 700;">${bb.hours.includes("24/7") ? "24/7 Desk" : "Open"}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.3; margin-bottom: 2px;">
            ${bb.name}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">
            ${bb.area}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <a href="tel:${bb.phone}" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background-color: #D92D3E; color: #ffffff; text-decoration: none; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">
              Call Desk (${bb.phone})
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${bb.coordinates.lat},${bb.coordinates.lng}" target="_blank" rel="noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background-color: #F1F5F9; color: #1E293B; text-decoration: none; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;">
              Get Directions &rarr;
            </a>
          </div>
        </div>
      `
      marker.bindPopup(popupHtml)

      marker.on("click", () => {
        if (onSelectBank) onSelectBank(bb)
      })

      markersRef.current.set(bb.id, marker)
    })

    // Fit bounds if we have valid bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
      })
    }
  }, [bloodBanks, userCoords, hospitalName])

  // Center/highlight when selectedBankId changes
  React.useEffect(() => {
    if (!selectedBankId || !mapInstanceRef.current) return
    const marker = markersRef.current.get(selectedBankId)
    if (marker) {
      const latLng = marker.getLatLng()
      mapInstanceRef.current.setView(latLng, 14, { animate: true })
      marker.openPopup()
    }
  }, [selectedBankId])

  // Reset View to fit all
  const handleFitAll = () => {
    if (!mapInstanceRef.current) return
    const bounds = L.latLngBounds([])
    if (userCoords) bounds.extend([userCoords.lat, userCoords.lng])
    bloodBanks.forEach((bb) => bounds.extend([bb.coordinates.lat, bb.coordinates.lng]))
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }

  // Center on user location
  const handleCenterUser = () => {
    if (!mapInstanceRef.current) return
    if (userCoords) {
      mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 14, { animate: true })
      userMarkerRef.current?.openPopup()
    } else if (bloodBanks.length > 0) {
      mapInstanceRef.current.setView(
        [bloodBanks[0].coordinates.lat, bloodBanks[0].coordinates.lng],
        13,
        { animate: true }
      )
    }
  }

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-border shadow-xs bg-card ${className}`}>
      {/* Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-[280px] sm:h-[340px] z-0" />

      {/* Floating Header Info Pill */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/80 shadow-xs text-xs">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold text-foreground">Live Hospital Blood Banks</span>
        <span className="text-muted-foreground text-[11px]">({bloodBanks.length} nearby)</span>
      </div>

      {/* Floating Controls: Fit All & Locate */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleCenterUser}
          title="Center on Patient Hospital"
          className="size-8 rounded-xl bg-background/95 hover:bg-background text-foreground border border-border/80 shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <LocateFixed className="size-4 text-primary" />
        </button>

        <button
          type="button"
          onClick={handleFitAll}
          title="Fit All Blood Banks in View"
          className="size-8 rounded-xl bg-background/95 hover:bg-background text-foreground border border-border/80 shadow-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Maximize2 className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Map Bottom Legend */}
      <div className="bg-background/95 backdrop-blur-md border-t border-border/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-primary border-2 border-white shadow-xs" />
            <span className="text-muted-foreground text-[11px] font-medium">Patient Hospital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#172033] border-2 border-white shadow-xs" />
            <span className="text-muted-foreground text-[11px] font-medium">Verified Blood Bank</span>
          </div>
        </div>

        <span className="text-[10px] text-muted-foreground font-mono">
          Tap any marker to view emergency desk contact
        </span>
      </div>
    </div>
  )
}
