import { useEffect, useMemo, useRef, useState } from 'react';
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
import { AlertCircle, MapPin, Navigation } from 'lucide-react';

interface StopPoint {
  booking: MerakiBooking;
  orderNumber: number;
  position: google.maps.LatLngLiteral;
}

interface RouteSummaryMetrics {
  distanceKm: string;
  durationMinutes: number;
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
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedStopCode, setSelectedStopCode] = useState<string | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<RouteSummaryMetrics | null>(null);

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

      points.push({
        booking: b,
        orderNumber: idx + 1,
        position: {
          lat: meta.lat + offset,
          lng: meta.lng - offset,
        },
      });
    }

    return points;
  }, [bookings, selectedDate]);

  const activeStop = useMemo(() => {
    if (!selectedStopCode) return null;

    return dailyStops.find((s) => s.booking.bookingCode === selectedStopCode) || null;
  }, [dailyStops, selectedStopCode]);

  if (!apiKey) {
    return (
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Configuración pendiente de VITE_GOOGLE_MAPS_API_KEY</p>
          <p className="mt-1 font-light">
            Agrega tu clave de Google Maps Platform en las variables de entorno para visualizar el mapa interactivo de rutas en Lima.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#5E765E]">
          <Navigation className="w-4 h-4 text-[#D5A688]" />
          <span>
            Ruta Domicilio ({selectedDate}): {dailyStops.length}{' '}
            {dailyStops.length === 1 ? 'parada' : 'paradas'} desde Pueblo Libre
          </span>
        </div>

        {routeMetrics && (
          <span className="px-3 py-1 rounded-full bg-[#5E765E]/10 text-[#5E765E] font-semibold">
            {routeMetrics.distanceKm} km • ~{routeMetrics.durationMinutes} min en vehículo
          </span>
        )}
      </div>

      <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-[#5E765E]/25 shadow-sm bg-[#EDF2EC]">
        <APIProvider apiKey={apiKey} libraries={['routes']}>
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
                  <p className="font-bold text-[#5E765E]">
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

      {dailyStops.length === 0 && (
        <p className="text-[11px] text-[#111111]/65 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#5E765E]" />
          <span>No hay citas a domicilio activas para {selectedDate}. El pin verde marca el estudio de Pueblo Libre.</span>
        </p>
      )}
    </div>
  );
}
