import { Fragment } from 'react'
import { CircleMarker, Polyline } from 'react-leaflet'
import { useRoutesForFields, type RouteResponse } from '@/features/routes/api'

interface RoutesLayerProps {
  fieldIds: readonly number[]
  selectedRouteId: number | null
  onRouteClick: (route: RouteResponse) => void
}

export function RoutesLayer({ fieldIds, selectedRouteId, onRouteClick }: RoutesLayerProps) {
  const queries = useRoutesForFields(fieldIds)
  const routes = queries.flatMap((q) => q.data ?? [])

  return (
    <>
      {routes.map((route) => {
        const positions = route.geometry.coordinates.map<[number, number]>(
          ([lng, lat]) => [lat, lng],
        )
        const selected = route.id === selectedRouteId
        const dimmed = selectedRouteId !== null && !selected
        const handlers = { click: () => onRouteClick(route) }
        return (
          <Fragment key={route.id}>
            <Polyline
              positions={positions}
              pathOptions={{
                color: '#fdf9f0',
                weight: selected ? 11 : 8,
                opacity: dimmed ? 0.15 : 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={handlers}
            />
            <Polyline
              positions={positions}
              pathOptions={{
                color: selected ? '#c2410c' : '#e8590c',
                weight: selected ? 7 : 5,
                opacity: dimmed ? 0.2 : 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={handlers}
            />
            {positions.length > 0 && (
              <>
                <CircleMarker
                  center={positions[0]}
                  radius={selected ? 8 : 6}
                  pathOptions={{
                    color: '#fdf9f0',
                    weight: 2,
                    fillColor: '#16a34a',
                    fillOpacity: dimmed ? 0.25 : 1,
                    opacity: dimmed ? 0.25 : 1,
                  }}
                  eventHandlers={handlers}
                />
                <CircleMarker
                  center={positions[positions.length - 1]}
                  radius={selected ? 8 : 6}
                  pathOptions={{
                    color: '#fdf9f0',
                    weight: 2,
                    fillColor: '#b91c1c',
                    fillOpacity: dimmed ? 0.25 : 1,
                    opacity: dimmed ? 0.25 : 1,
                  }}
                  eventHandlers={handlers}
                />
              </>
            )}
          </Fragment>
        )
      })}
    </>
  )
}
