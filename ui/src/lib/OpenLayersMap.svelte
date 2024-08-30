<script lang="ts">
  import { Feature, Map, View } from 'ol'
  import { OSM, Vector } from 'ol/source'
  import TileLayer from 'ol/layer/Tile'

  import { LineString, Point, Polygon } from 'ol/geom'
  import { createEventDispatcher, onMount } from 'svelte'
  import 'ol/ol.css'
  import { fromLonLat } from 'ol/proj'
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

  useGeographic()
  let dispatch = createEventDispatcher()

  // export let maxDevicePoints = 10

  let mapElement: HTMLDivElement
  let map: Map
  let layers: Record<string, Layer> = {}

  export let center = undefined
  export let zoom = center ? 12 : 5

  if (!center) center = [-90.3242479, 39.5167587]

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
            var iconStyle = new Style({
              image: new Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: data.icon,
                scale: 0.25
              }),
              text: new Text({
                font: '15px Calibri,sans-serif',
                fill: new Fill({ color: '#000' }),
                offsetY: 20,
                stroke: new Stroke({
                  color: '#fff',
                  width: 5
                }),
                text: feature.get('description')
              })
            })
            feature.setStyle(iconStyle)
          }
          return feature
        })
      })
    })

    map.addLayer(layers[layerName])
  }

  export function plotLines(layerName: string, data: number[][][]) {
    if (layers[layerName]) map.removeLayer(layers[layerName])

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

      renderBuffer: 100000
    })

    map.addLayer(layers[layerName])
  }

  export function flyTo(long, lat) {
    map.getView().animate({
      center: [long, lat]
    })
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

  onMount(() => {
    map = new Map({ target: mapElement })
    map.setView(
      new View({
        center,
        zoom
      })
    )
    map.setLayers([
      new TileLayer({
        source: new OSM()
      })
    ])
    // plotLocations()
  })
</script>

<div bind:this={mapElement} class="h-full" />
