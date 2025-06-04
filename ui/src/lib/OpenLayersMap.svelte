<script lang="ts">
  import { Feature, Map, View } from 'ol'
  import { OSM, Vector } from 'ol/source'
  import TileLayer from 'ol/layer/Tile'
  import Control from 'ol/control/Control'
  import { defaults as defaultControls } from 'ol/control'

  import { LineString, Point, Polygon } from 'ol/geom'
  import { createEventDispatcher, onMount } from 'svelte'
  import 'ol/ol.css'
  import { fromLonLat, toLonLat } from 'ol/proj'
  import type Layer from 'ol/layer/Layer'
  import VectorLayer from 'ol/layer/Vector'
  import Style from 'ol/style/Style'
  import Stroke from 'ol/style/Stroke'
  import Circle from 'ol/style/Circle'
  import Fill from 'ol/style/Fill'
  import { useGeographic } from 'ol/proj'
  import Icon from 'ol/style/Icon'
  import { descending } from 'ol/array'
  import Text from 'ol/style/Text'
  import type { LoadingStrategy } from 'ol/source/Vector'
  import type { Coordinate } from 'ol/coordinate'
  import VectorSource from 'ol/source/Vector'

  useGeographic()
  let dispatch = createEventDispatcher()

  // export let maxDevicePoints = 10

  let mapElement: HTMLDivElement
  let map: Map
  let layers: Record<string, Layer> = {}

  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  let darkMode = (localStorage.getItem('darkMode') ?? String(prefersDarkMode)) == 'true'

  export let center = undefined
  export let zoom = 12
  export let onMove: (center: Coordinate, zoom: number) => void = undefined
  export let onClick: (latitude: number, longitude: number) => void = undefined
  export let onDarkModeToggle: () => void = undefined

  if (!center || (center[0] == 0 && center[1] == 0)) {
    center = [-90.3242479, 39.5167587]
    zoom = 4
  }

  // $: if ($lastUpdate && map) {
  // 	plotPoints($lastUpdate.aid)
  // 	if ($lastUpdate.aid == $followId) centerOnDevice(devices[$followId])
  // }

  // $: if ($selectedDevice && map) centerOnDevice($selectedDevice)
  // $: if (devices[$followId] && map) centerOnDevice(devices[$followId])

  // function centerOnDevice(device: Device, includeHistory = false) {
  // 	let id = device.locationHistory[0]?.aid
  // 	if (includeHistory) {
  // 		let extent = (layers[id]?.getSource() as Vector).getExtent()
  // 		if (extent) map.getView().fit(extent, { padding: [2000, 2000, 2000, 2000], maxZoom: 17 })
  // 	} else {
  // 		map.getView().setCenter([device.locationHistory[0].lon, device.locationHistory[0].lat])
  // 	}
  // }

  // function getStyle(id: string, opacity = 1) {
  // 	return new Style({
  // 		image: new Circle({
  // 			radius: (opacity + 2) * 5,
  // 			fill: new Fill({
  // 				color: `rgba(${devices[id].color},${opacity})`
  // 			})
  // 		})
  // 	})
  // }

  export function plotPoints(layerName: string, data: { lat: number; lon: number; icon: string; description: string }[]) {
    if (layers[layerName]) map.removeLayer(layers[layerName])

    layers[layerName] = new VectorLayer({
      source: new Vector({
        features: data.map((data) => {
          let feature = new Feature({
            geometry: new Point([data.lon, data.lat])
          })

          feature.set('description', data.description)

          if (data.icon) {
            feature.setStyle(
              new Style({
                image: new Icon({
                  anchor: [0.5, 46],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'pixels',
                  src: data.icon,
                  scale: 0.25
                }),
                text: new Text({
                  font: '15px Calibri,sans-serif',
                  fill: new Fill({ color: !darkMode ? '#000' : '#fff' }),
                  offsetY: 20,
                  stroke: new Stroke({
                    color: !darkMode ? '#fff' : '#000',
                    width: 4
                  }),
                  text: feature.get('description')
                })
              })
            )
          }
          return feature
        })
      }),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    map.addLayer(layers[layerName])
  }

  export function plotLines(layerName: string, data: number[][][]) {
    if (layers[layerName]) map.removeLayer(layers[layerName])

    // console.log('[OLM] plotLines', data)
    layers[layerName] = new VectorLayer({
      source: new Vector({
        features: data.map((points) => {
          let feature = new Feature({
            geometry: new LineString(points),
            name: 'Line'
          })
          // feature.setStyle({st})
          return feature
        })
      }),
      style: { 'stroke-width': 4, 'stroke-color': 'rgba(50,50,150, 0.6)' },

      renderBuffer: 100000,
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    map.addLayer(layers[layerName])
  }

  export function flyTo(long, lat) {
    map.getView().animate({
      center: [long, lat],
      zoom: 15
    })
  }

  export function showPin(description?: string, long?: number, lat?: number, icon?: string) {
    if (long == undefined || lat == undefined) return

    let layer = new VectorLayer({
      source: new Vector({
        features: [
          new Feature({
            geometry: new Point([long, lat])
          })
        ]
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: icon ?? `${import.meta.env.VITE_PATH || ''}/map-marker-alt-solid.svg`,
          scale: 0.25,
          opacity: 0.75
        }),
        text: new Text({
          font: '15px Calibri,sans-serif',
          fill: new Fill({ color: !darkMode ? '#000' : '#fff' }),
          offsetY: -20,
          stroke: new Stroke({
            color: !darkMode ? '#fff' : '#000',
            width: 4
          }),
          text: description || ''
        })
      })
    })

    map.addLayer(layer)
    setTimeout(() => map.removeLayer(layer), 60000)

    flyTo(long, lat)
  }

  // function plotLocations() {
  // 	if (layers['locations']) map.removeLayer(layers['locations'])
  // 	layers['locations'] = new VectorLayer({
  // 		source: new Vector({
  // 			features: locations.map((l) => {
  // 				return new Feature({
  // 					geometry: new Polygon(l.coordinates)
  // 				})
  // 			})
  // 		})
  // 	})
  // 	map.addLayer(layers['locations'])
  // 	dispatch('mapReady')
  // }

  function toggleMapDarkMode() {
    darkMode = !darkMode
    localStorage.setItem('darkMode', String(darkMode))
    if (onDarkModeToggle) onDarkModeToggle()
    // for (let name of Object.keys(layers)) {
    //   layers[name].changed()
    // }
  }

  class ToggleDarkModeControl extends Control {
    constructor() {
      const button = document.createElement('button')
      button.innerHTML = !darkMode ? '☼' : '☾' // button.iHTML = '☼'
      button.title = 'Toggle Dark Mode'

      const element = document.createElement('div')
      element.className = 'ol-unselectable ol-control ol-control-darkmode'
      element.appendChild(button)

      super({ element: element })
      button.addEventListener('click', this.handleToggleDarkMode.bind(this), false)
    }

    handleToggleDarkMode() {
      const button = this.element.querySelector('button')
      button.innerHTML = !darkMode ? '☾' : '☼'
      toggleMapDarkMode()
    }
  }

  onMount(() => {
    map = new Map({
      controls: defaultControls().extend([new ToggleDarkModeControl()]),
      target: mapElement
    })
    // console.log('[OLM] Creating Map', { center, zoom })
    map.setView(
      new View({
        center,
        zoom
      })
    )

    const tile = new TileLayer({
      source: new OSM()
    })
    map.setLayers([tile])

    map.on('moveend', (e) => {
      if (onMove) onMove(map.getView().getCenter(), map.getView().getZoom())
    })
    // plotLocations()
    map.on('click', (e) => {
      let point = map.getCoordinateFromPixel(e.pixel)
      if (onClick) onClick(point[1], point[0])
    })

    tile.on('prerender', function (e) {
      if (darkMode) {
        const cx = e.context as CanvasRenderingContext2D
        cx.filter = 'brightness(.6) invert(.9) contrast(2) hue-rotate(200deg) saturate(.8) brightness(.7)'
        cx.globalCompositeOperation = 'source-over'
      }
    })
    tile.on('postrender', (e) => {
      if (darkMode) {
        const cx = e.context as CanvasRenderingContext2D
        cx.filter = 'none'
        cx.globalCompositeOperation = 'source-over'
      }
    })
  })

  // Exposed to parent components
  export function plotTrail(coordinates: [number, number][]) {
    console.log('→ plotTrail called, adding layer with', coordinates.length, 'pts');
    if (layers['trail']) {
      map.removeLayer(layers['trail']);
      delete layers['trail'];
    }

    const trailLayer = new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new LineString(coordinates)
          })
        ]
      }),
      style: new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 2
          lineDash: [6, 10]
        })
      }),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    layers['trail'] = trailLayer;
    map.addLayer(trailLayer);
  }

  export function plotTrailMarkers(points: { coords: [number, number]; ts: number }[]) {
    if (layers['trailMarkers']) {
      map.removeLayer(layers['trailMarkers']);
      delete layers['trailMarkers'];
    }

    if (points.length === 0) return;

    const features = points.map(p => {
      const feature = new Feature({
        geometry: new Point(p.coords)
      });
      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({ color: '#f00' }),
            stroke: new Stroke({ color: '#fff', width: 1 })
          }),
          text: new Text({
            font: '12px sans-serif',
            offsetY: -12,
            fill: new Fill({ color: !darkMode ? '#000' : '#fff' }),
            stroke: new Stroke({ color: !darkMode ? '#fff' : '#000', width: 3 }),
            text: new Date(p.ts).toLocaleTimeString()
          })
        })
      );
      return feature;
    });

    const layer = new VectorLayer({
      source: new VectorSource({ features }),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    layers['trailMarkers'] = layer;
    map.addLayer(layer);
  }
</script>

<div bind:this={mapElement} class="h-full" />
