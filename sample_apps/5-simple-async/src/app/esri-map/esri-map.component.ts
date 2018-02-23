import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from 'esri-loader';

import { MapStateService } from '../services/map-state.service';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})

export class EsriMapComponent implements OnInit {

  public mapView: __esri.MapView;
  msService: MapStateService;

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor(msService: MapStateService) {
    this.msService = msService;
  }

  public ngOnInit() {
    // use esri-loader to load JSAPI modules
    return loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/Graphic'
    ])
      .then(([Map, MapView, Graphic]) => {
        const map: __esri.Map = new Map({
          basemap: 'hybrid'
        });

        this.mapView = new MapView({
          container: this.mapViewEl.nativeElement,
          center: [-12.287, -37.114],
          zoom: 12,
          map: map
        });

        this.mapView.when(
          () => {
            if (this.msService.points.length) {
              // add any point graphics stored in the MapStateService
              // from the user's clicks from previous navigations to this app route
              this.mapView.graphics.addMany(this.msService.points);
            }
          },
          (err) => {
            console.log(err);
          }
        );

        this.mapView.on('click', (event: __esri.MapViewClickEvent) => {
          const pointGraphic: __esri.Graphic = new Graphic({
            geometry: {
              type: 'point',
              longitude: event.mapPoint.longitude,
              latitude: event.mapPoint.latitude,
              spatialReference: event.mapPoint.spatialReference
            },
            symbol: {
              type: 'simple-marker',
              color: [119, 40, 119],
              outline: {
                color: [255, 255, 255],
                width: 1
              }
            }
          });

          this.msService.addPoint(pointGraphic);

          this.mapView.graphics.add(this.msService.points[this.msService.points.length - 1]);
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
}
