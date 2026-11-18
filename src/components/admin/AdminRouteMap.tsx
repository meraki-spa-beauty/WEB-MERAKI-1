/**
 * ============================================================================
 * NOTA DE ARQUITECTURA / MIGRACIÓN FUTURA DE MAPA:
 * Cuando se retome el desarrollo del mapa para eliminar por completo Google Maps
 * (y evitar riesgos de caducidad o facturación de API Keys), migrar este componente
 * hacia Leaflet / MapLibre GL JS + Protomaps PMTiles (Lima local) + OSRM para
 * trazado de rutas. Mantener los enlaces externos actuales ("Ver en Google Maps")
 * como respaldo gratuito de navegación.
 * ============================================================================
 */
import { Component, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import type { MerakiBooking } from '../../types';
import { SPA_INFO } from '../../data/spaData';
import { getDistrictMeta } from '../../utils/scheduleEngine';
import { AlertCircle, ExternalLink, MapPin, Navigation } from 'lucide-react';

interface StopPoint {
  booking: MerakiBooking;
  orderNumber: number;
  position: google.maps.LatLngLiteral;
  mapsQuery: string;
}

interface RouteSummaryMetrics {
  distanceKm: string;
  durationMinutes: number;
}

type MapFailureReason = 'auth' | 'quota' | 'runtime' | null;

interface MapBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface MapBoundaryState {
  hasError: boolean;
}

class MapCanvasErrorBoundary extends Component<MapBoundaryProps, MapBoundaryState> {
  state: MapBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

function isValidGoogleMapsApiKeyFormat(rawKey: string): boolean {
  return /^AIza[0-9A-Za-z_-]{30,}$/.test(rawKey.trim());
}

function buildGoogleMapsRouteUrl(stops: StopPoint[]): string {
  const studioOrigin = `${SPA_INFO.studioAddress}, Lima, Peru`;

  if (stops.length === 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studioOrigin)}`;
  }

  const destination = stops[stops.length - 1].mapsQuery;
  const waypoints: string[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    waypoints.push(stops[i].mapsQuery);
  }

  const params = new URLSearchParams({
    api: '1',
    origin: studioOrigin,
    destination,
    travelmode: 'driving',
  });

  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.join('|'));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function DailyRouteRenderer({
  stops,
  onMetricsUpdate,
}: {
  stops: StopPoint[];
  onMetricsUpdate: (metrics: RouteSummaryMetrics | null) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    for (const line of polylinesRef.current) {
      line.setMap(null);
    }

    polylinesRef.current = [];

    if (!map || !routesLib || stops.length === 0) {
      onMetricsUpdate(null);

      return;
    }

    let cancelled = false;
    const origin = SPA_INFO.studioCoordinates;
    const destination = stops[stops.length - 1].position;
    const intermediates: google.maps.routes.Waypoint[] = [];

    for (let i = 0; i < stops.length - 1; i++) {
      intermediates.push({ location: stops[i].position });
    }

    const request: google.maps.routes.ComputeRoutesRequest = {
      origin,
      destination,
      intermediates: intermediates.length > 0 ? intermediates : undefined,
      travelMode: routesLib.TravelMode.DRIVING,
      fields: ['path', 'viewport', 'distanceMeters', 'durationMillis', 'legs'],
    };

    routesLib.Route.computeRoutes(request)
      .then(({ routes }) => {
        if (cancelled) return;

        if (!routes || routes.length === 0) {
          onMetricsUpdate(null);

          return;
        }

        const primaryRoute = routes[0];

        const newPolylines = primaryRoute.createPolylines({
          polylineOptions: {
            strokeColor: '#5E765E',
            strokeOpacity: 0.9,
            strokeWeight: 5,
          },
        });

        for (const poly of newPolylines) {
          poly.setMap(map);
        }

        polylinesRef.current = newPolylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport);
        }

        const meters = primaryRoute.distanceMeters || 0;
        const millis = primaryRoute.durationMillis || 0;

        onMetricsUpdate({
          distanceKm: (meters / 1000).toFixed(1),
          durationMinutes: Math.max(1, Math.round(millis / 60000)),
        });
      })
      .catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : String(cause);

        if (
          message.includes('RESOURCE_EXHAUSTED') ||
          message.includes('OVER_QUERY_LIMIT') ||
          message.includes('429') ||
          message.includes('quota')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        } else if (
          message.includes('API_KEY') ||
          message.includes('PERMISSION_DENIED') ||
          message.includes('REQUEST_DENIED') ||
          message.includes('403')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
        }
      });

    return () => {
      cancelled = true;

      for (const line of polylinesRef.current) {
        line.setMap(null);
      }

      polylinesRef.current = [];
    };
  }, [map, routesLib, stops, onMetricsUpdate]);

  return null;
}

export function AdminRouteMap({
  selectedDate,
  bookings,
}: {
  selectedDate: string;
  bookings: MerakiBooking[];
}) {
  const rawApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const apiKey = rawApiKey.trim();
  const hasValidKeyFormat = isValidGoogleMapsApiKeyFormat(apiKey);

  const [selectedStopCode, setSelectedStopCode] = useState<string | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<RouteSummaryMetrics | null>(null);
  const [mapFailureReason, setMapFailureReason] = useState<MapFailureReason>(null);

  useEffect(() => {
    const handleAuthFailure = () => {
      setMapFailureReason('auth');
    };

    const handleQuotaFailure = () => {
      setMapFailureReason('quota');
    };

    window.addEventListener('gmp-auth-failure', handleAuthFailure);
    window.addEventListener('gmp-quota-exceeded', handleQuotaFailure);

    return () => {
      window.removeEventListener('gmp-auth-failure', handleAuthFailure);
      window.removeEventListener('gmp-quota-exceeded', handleQuotaFailure);
    };
  }, []);

  const dailyStops = useMemo(() => {
    const filtered: MerakiBooking[] = [];

    for (const b of bookings) {
      if (b.date === selectedDate && b.status !== 'cancelled' && b.locationType !== 'estudio') {
        filtered.push(b);
      }
    }

    filtered.sort((a, b) => (a.timeSlot < b.timeSlot ? -1 : 1));

    const countsByDistrict: Record<string, number> = {};
    const points: StopPoint[] = [];

    for (let idx = 0; idx < filtered.length; idx++) {
      const b = filtered[idx];
      const meta = getDistrictMeta(b.district);
      const count = countsByDistrict[meta.name] || 0;

      countsByDistrict[meta.name] = count + 1;

      const offset = count * 0.0028;
      const addressPart = b.address ? `${b.address}, ${b.district}, Lima, Peru` : `${b.district}, Lima, Peru`;

      points.push({
        booking: b,
        orderNumber: idx + 1,
        position: {
          lat: meta.lat + offset,
          lng: meta.lng - offset,
        },
        mapsQuery: addressPart,
      });
    }

    return points;
  }, [bookings, selectedDate]);

  const activeStop = useMemo(() => {
    if (!selectedStopCode) return null;

    return dailyStops.find((s) => s.booking.bookingCode === selectedStopCode) || null;
  }, [dailyStops, selectedStopCode]);

  const externalRouteUrl = useMemo(() => buildGoogleMapsRouteUrl(dailyStops), [dailyStops]);
  const canRenderInteractiveMap = hasValidKeyFormat && mapFailureReason === null;

  const fallbackNotice = useMemo(() => {
    if (!apiKey) {
      return {
        title: 'Mapa interactivo pendiente de clave de Google Cloud',
        body: 'Agrega una clave real de Google Maps Platform en el secreto VITE_GOOGLE_MAPS_API_KEY cuando desees activar el mapa incrustado. Mientras tanto, usa la lista cronológica de paradas y el enlace directo a Google Maps.',
      };
    }

    if (!hasValidKeyFormat) {
      return {
        title: 'Credencial de Google Maps pendiente de reemplazo',
        body: 'El valor actual de VITE_GOOGLE_MAPS_API_KEY no corresponde a una clave de Google Cloud (inician con AIza...). Usa la lista de paradas de abajo o abre la ruta directa en Google Maps mientras configuras una clave real.',
      };
    }

    if (mapFailureReason === 'quota') {
      return {
        title: 'Cuota temporal de Google Maps alcanzada',
        body: 'El mapa interactivo alcanzó su límite temporal. Puedes consultar todas las paradas del día aquí abajo y abrir la ruta directa en Google Maps.',
      };
    }

    if (mapFailureReason === 'auth') {
      return {
        title: 'Google Maps rechazó la clave o el dominio actual',
        body: 'Verifica en Google Cloud que tu clave tenga Maps JavaScript API y Routes API habilitadas, facturación activa y el referente https://merakispa.web.app/*. Mientras tanto, usa el enlace directo a Google Maps.',
      };
    }

    return {
      title: 'Mapa interactivo no disponible temporalmente',
      body: 'Se activó la vista de respaldo con el orden de paradas y navegación directa en Google Maps.',
    };
  }, [apiKey, hasValidKeyFormat, mapFailureReason]);

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#5E765E]">
          <Navigation className="w-4 h-4 text-[#D5A688]" />
          <span className="tabular-nums">
            Ruta Domicilio ({selectedDate}): {dailyStops.length}{' '}
            {dailyStops.length === 1 ? 'parada' : 'paradas'} desde Pueblo Libre
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {routeMetrics && canRenderInteractiveMap && (
            <span className="px-3 py-1 rounded-full bg-[#5E765E]/10 text-[#5E765E] font-semibold tabular-nums">
              {routeMetrics.distanceKm} km • ~{routeMetrics.durationMinutes} min en vehículo
            </span>
          )}

          <a
            href={externalRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] font-semibold transition-colors whitespace-nowrap"
          >
            <span>{dailyStops.length > 0 ? 'Abrir Ruta en Google Maps' : 'Ver Estudio en Google Maps'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D5A688]" />
          </a>
        </div>
      </div>

      {canRenderInteractiveMap ? (
        <MapCanvasErrorBoundary onError={() => setMapFailureReason('runtime')}>
          <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-[#5E765E]/25 shadow-sm bg-[#EDF2EC]">
            <APIProvider
              apiKey={apiKey}
              libraries={['routes', 'marker']}
              onError={() => setMapFailureReason('auth')}
            >
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={SPA_INFO.studioCoordinates}
                defaultZoom={12}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {/* Studio Origin Pin */}
                <AdvancedMarker position={SPA_INFO.studioCoordinates} title="Estudio Meraki (Pueblo Libre)">
                  <Pin background="#5E765E" borderColor="#FFF2DE" glyphColor="#D5A688" glyph="M" />
                </AdvancedMarker>

                {/* Chronological Domicilio Pins */}
                {dailyStops.map((stop) => (
                  <AdvancedMarker
                    key={stop.booking.bookingCode}
                    position={stop.position}
                    title={`${stop.orderNumber}. ${stop.booking.clientName} (${stop.booking.timeSlot})`}
                    onClick={() => setSelectedStopCode(stop.booking.bookingCode)}
                  >
                    <Pin
                      background="#D5A688"
                      borderColor="#111111"
                      glyphColor="#111111"
                      glyph={String(stop.orderNumber)}
                    />
                  </AdvancedMarker>
                ))}

                {activeStop && (
                  <InfoWindow
                    position={activeStop.position}
                    onCloseClick={() => setSelectedStopCode(null)}
                  >
                    <div className="p-1 text-xs text-[#111111] max-w-[220px] space-y-1">
                      <p className="font-bold text-[#5E765E] tabular-nums">
                        #{activeStop.orderNumber} • {activeStop.booking.timeSlot} hrs
                      </p>
                      <p className="font-semibold">{activeStop.booking.clientName}</p>
                      <p className="text-[11px] text-[#111111]/75">
                        {activeStop.booking.district}
                        {activeStop.booking.address ? ` — ${activeStop.booking.address}` : ''}
                      </p>
                      <p className="text-[11px] font-medium">{activeStop.booking.servicesSummary}</p>
                    </div>
                  </InfoWindow>
                )}

                <DailyRouteRenderer stops={dailyStops} onMetricsUpdate={setRouteMetrics} />
              </GoogleMap>
            </APIProvider>
          </div>
        </MapCanvasErrorBoundary>
      ) : (
        <div className="rounded-2xl border border-[#5E765E]/20 bg-[#FFFDF9] overflow-hidden">
          <div className="p-4 bg-amber-50/90 border-b border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-semibold">{fallbackNotice.title}</p>
              <p className="mt-1 font-light leading-relaxed text-amber-900">{fallbackNotice.body}</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#5E765E]/15 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-[#5E765E] text-[#FFF2DE] font-bold text-[11px] inline-flex items-center justify-center shrink-0">
                  M
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-[#111111] block">Salida: Estudio Meraki</span>
                  <span className="text-[11px] text-[#111111]/65 truncate block">
                    {SPA_INFO.studioAddress}, Pueblo Libre
                  </span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${SPA_INFO.studioAddress}, Lima, Peru`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-[#5E765E] hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Ver estudio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {dailyStops.length === 0 ? (
              <p className="text-xs text-[#111111]/70 py-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5E765E] shrink-0" />
                <span>No hay citas a domicilio activas para el {selectedDate}.</span>
              </p>
            ) : (
              <div className="divide-y divide-[#5E765E]/10">
                {dailyStops.map((stop) => (
                  <div
                    key={stop.booking.bookingCode}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-full bg-[#D5A688]/30 border border-[#D5A688] text-[#111111] font-bold text-[11px] inline-flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                        {stop.orderNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111111] tabular-nums">
                          {stop.booking.timeSlot} hrs — {stop.booking.clientName}
                        </p>
                        <p className="text-[11px] text-[#111111]/75">
                          {stop.booking.district}
                          {stop.booking.address ? ` · ${stop.booking.address}` : ''}
                        </p>
                        <p className="text-[11px] text-[#5E765E] font-medium mt-0.5">
                          {stop.booking.servicesSummary}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.mapsQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#5E765E]/25 bg-[#EDF2EC]/70 hover:bg-[#EDF2EC] text-[#5E765E] text-[11px] font-semibold transition-colors shrink-0"
                    >
                      <span>Ver en Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {canRenderInteractiveMap && dailyStops.length === 0 && (
        <p className="text-[11px] text-[#111111]/65 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#5E765E]" />
          <span>No hay citas a domicilio activas para {selectedDate}. El pin verde marca el estudio de Pueblo Libre.</span>
        </p>
      )}
    </div>
  );
}
