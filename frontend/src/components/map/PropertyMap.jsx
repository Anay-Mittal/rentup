import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Navigation, Satellite } from 'lucide-react';
import { API_BASE_URL as BASE_URL } from '../../config';
import './PropertyMap.css';
const DEFAULT_CENTER = [19.076, 72.8777]; // Mumbai
const DEFAULT_RADIUS = 5000; // meters
const DEBOUNCE_MS = 450;

// Fix default marker icons (Leaflet+webpack path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const formatPrice = (p) => {
  const n = Number(p.price || 0).toLocaleString('en-IN');
  return p.listingType === 'rent' ? `₹${n}/${p.rentPeriod || 'monthly'}` : `₹${n}`;
};

// Helper: listens to map move events and notifies parent with debounce
const MapBindings = ({ onCenterChange, setMapRef }) => {
  const map = useMap();
  const timer = useRef(null);

  useEffect(() => {
    setMapRef?.(map);
  }, [map, setMapRef]);

  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onCenterChange?.([c.lat, c.lng]);
      }, DEBOUNCE_MS);
    },
  });

  return null;
};

const PropertyMap = ({
  variant = 'full', // 'full' | 'preview'
  initialCenter,
  height,
  radius = DEFAULT_RADIUS,
  onResults,
}) => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(initialCenter || DEFAULT_CENTER);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Fetch on center change
  useEffect(() => {
    let cancelled = false;
    const fetchNearby = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${BASE_URL}/api/properties/nearby`, {
          params: { lat: center[0], lng: center[1], radius },
        });
        if (cancelled) return;
        const list = data.properties || [];
        setProperties(list);
        onResults?.(list, { center, radius });
      } catch (err) {
        if (cancelled) return;
        console.error('Nearby fetch failed:', err);
        setError('Could not load nearby properties.');
        setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNearby();
    return () => {
      cancelled = true;
    };
  }, [center, radius, onResults]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = [pos.coords.latitude, pos.coords.longitude];
        setCenter(next);
        if (mapRef.current) {
          mapRef.current.setView(next, 13, { animate: true });
        }
        setLocating(false);
      },
      (err) => {
        console.warn(err);
        setError('Location permission denied or unavailable.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openProperty = (id) => navigate(`/property/${id}`);

  const mapHeight = height || (variant === 'preview' ? 260 : 420);

  const markers = useMemo(
    () =>
      properties
        .filter((p) => p.coordinates?.coordinates?.length === 2)
        .map((p) => ({
          id: p._id,
          lat: p.coordinates.coordinates[1],
          lng: p.coordinates.coordinates[0],
          raw: p,
        })),
    [properties]
  );

  return (
    <div className={`pm-wrap pm-variant-${variant}`}>
      <div className="pm-header">
        <div className="pm-title">
          <Satellite size={16} />
          <div>
            <h3>NavIC-assisted Property Search</h3>
            <p>
              Pan the map to explore an area. We'll show listings within{' '}
              {radius / 1000} km of the center.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="pm-locate"
          onClick={useMyLocation}
          disabled={locating}
        >
          <Navigation size={14} />
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      <div className="pm-stage" style={{ height: mapHeight }}>
        <MapContainer
          center={center}
          zoom={variant === 'preview' ? 11 : 12}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={center}
            radius={radius}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.08,
              weight: 1.5,
            }}
          />
          <MapBindings onCenterChange={setCenter} setMapRef={(m) => (mapRef.current = m)} />
          {markers.map((mk) => (
            <Marker key={mk.id} position={[mk.lat, mk.lng]}>
              <Popup>
                <div className="pm-popup">
                  <strong>{mk.raw.title}</strong>
                  <div className="pm-popup-meta">
                    <span
                      className={`pm-chip ${
                        mk.raw.listingType === 'rent' ? 'chip-rent' : 'chip-sale'
                      }`}
                    >
                      {mk.raw.listingType === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                    </span>
                    <span className="pm-price">{formatPrice(mk.raw)}</span>
                  </div>
                  <div className="pm-popup-loc">{mk.raw.location}</div>
                  <button
                    type="button"
                    className="pm-popup-btn"
                    onClick={() => openProperty(mk.id)}
                  >
                    View details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pm-crosshair" aria-hidden="true">
          <Crosshair size={28} />
        </div>
      </div>

      <div className="pm-footer">
        {error ? (
          <span className="pm-error">{error}</span>
        ) : loading ? (
          <span className="pm-status">Searching within {radius / 1000} km…</span>
        ) : properties.length === 0 ? (
          <span className="pm-status pm-empty">
            No properties in this area. Try panning to another location.
          </span>
        ) : (
          <span className="pm-status pm-ok">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} in this area
          </span>
        )}
        {variant === 'preview' && (
          <button
            type="button"
            className="pm-cta"
            onClick={() => navigate('/all-property')}
          >
            Open full map →
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyMap;
