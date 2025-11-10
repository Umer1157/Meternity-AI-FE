import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './GynecologistMap.css'

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function GynecologistMap({ show, onClose }) {
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gynecologists, setGynecologists] = useState([])
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (show) {
      getCurrentLocation()
    } else {
      // Clean up map when modal closes
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markersRef.current = []
    }
  }, [show])

  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      // Use default location (can be set to a common location)
      setUserLocation({ lat: 24.8607, lng: 67.0011 }) // Default to Karachi, Pakistan
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        setLoading(false)
      },
      (err) => {
        console.error('Error getting location:', err)
        setError('Unable to get your location. Please enable location services.')
        // Use default location as fallback
        setUserLocation({ lat: 24.8607, lng: 67.0011 }) // Default to Karachi, Pakistan
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Calculate distance between two coordinates using Haversine formula (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Search for gynecologists using Nominatim API (free, no API key)
  const searchGynecologists = async (lat, lng) => {
    try {
      setLoading(true)
      setError(null)
      
      // Set radius to 45km (45000 meters)
      const maxRadiusKm = 45
      const maxRadiusMeters = maxRadiusKm * 1000
      
      // Use Nominatim API to search for gynecologists (free, no signup required)
      const queries = [
        `gynecologist near ${lat},${lng}`,
        `obstetrician near ${lat},${lng}`,
        `women's health clinic near ${lat},${lng}`
      ]
      
      let allResults = []
      
      // Try multiple search queries to get better results
      for (const query of queries) {
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=20&lat=${lat}&lon=${lng}&radius=${maxRadiusMeters}&addressdetails=1`
          
          const response = await fetch(nominatimUrl, {
            headers: {
              'User-Agent': 'MaternalHealthApp/1.0'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const results = data
              .filter(item => item.lat && item.lon && 
                (item.type === 'doctor' || 
                 item.type === 'hospital' || 
                 item.type === 'clinic' ||
                 item.display_name.toLowerCase().includes('gynec') ||
                 item.display_name.toLowerCase().includes('obstetr') ||
                 item.display_name.toLowerCase().includes('women')))
              .map(item => {
                const resultLat = parseFloat(item.lat)
                const resultLng = parseFloat(item.lon)
                const distance = calculateDistance(lat, lng, resultLat, resultLng)
                
                return {
                  name: item.display_name.split(',')[0] || 'Gynecologist',
                  address: item.display_name || '',
                  phone: item.extratags?.phone || '',
                  lat: resultLat,
                  lng: resultLng,
                  distance: distance // Store distance for filtering and sorting
                }
              })
              // Filter to only include results within the specified radius
              .filter(result => result.distance <= maxRadiusKm)
            
            allResults = [...allResults, ...results]
          }
        } catch (err) {
          console.log('Search query failed:', query, err)
        }
      }
      
      // Remove duplicates based on coordinates
      const uniqueResults = []
      const seen = new Set()
      
      allResults.forEach(result => {
        const key = `${result.lat.toFixed(4)}_${result.lng.toFixed(4)}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueResults.push(result)
        }
      })
      
      // Sort by distance (closest first) and limit to 20 results
      const finalResults = uniqueResults
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20)
      
      setGynecologists(finalResults)
      
      if (finalResults.length === 0) {
        setError(`No gynecologists found within ${maxRadiusKm}km. Try searching in a larger area.`)
      }
    } catch (err) {
      console.error('Error searching:', err)
      setError('Could not find gynecologists. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Initialize map and add markers
  useEffect(() => {
    if (!show || !userLocation || !mapRef.current) return

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13)
      
      // Add OpenStreetMap tiles (free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)

      // Add user location marker
      const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Your Location</b>')
        .openPopup()
    }

    // Search for gynecologists
    searchGynecologists(userLocation.lat, userLocation.lng)

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker)
        }
      })
      markersRef.current = []
    }
  }, [show, userLocation])

  // Add gynecologist markers to map
  useEffect(() => {
    if (!mapInstanceRef.current || !gynecologists.length) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Create custom icon for gynecologists
    const gynoIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    // Add markers for each gynecologist
    gynecologists.forEach((gyno) => {
      const distanceText = gyno.distance ? `<small>📍 ${gyno.distance.toFixed(1)} km away</small><br/>` : ''
      const popupContent = `
        <div style="min-width: 200px;">
          <b>${gyno.name}</b><br/>
          ${distanceText}
          ${gyno.address ? `<small>${gyno.address}</small><br/>` : ''}
          ${gyno.phone ? `<small>📞 ${gyno.phone}</small>` : ''}
        </div>
      `
      
      const marker = L.marker([gyno.lat, gyno.lng], { icon: gynoIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent)
      
      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (gynecologists.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      if (markersRef.current.length > 0) {
        group.addLayer(L.marker([userLocation.lat, userLocation.lng]))
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }, [gynecologists, userLocation])

  if (!show) return null

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h2>Find Nearby Gynecologists</h2>
          <button className="map-modal-close" onClick={onClose}>×</button>
        </div>
        
        {loading && (
          <div className="map-loading">
            <p>Getting your location and searching for gynecologists...</p>
          </div>
        )}

        {error && (
          <div className="map-error">
            <p>{error}</p>
          </div>
        )}

        <div className="map-container">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
        </div>

        <div className="map-info">
          <p>📍 <strong>Red marker:</strong> Your location | <strong>Blue markers:</strong> Nearby gynecologists (within 45km)</p>
          {gynecologists.length > 0 && (
            <p>Found {gynecologists.length} gynecologist{gynecologists.length !== 1 ? 's' : ''} within 45km of your location</p>
          )}
          <p>Click on markers to see details and distance</p>
        </div>
      </div>
    </div>
  )
}

export default GynecologistMap

