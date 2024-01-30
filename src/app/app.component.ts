import { Component, OnInit, ViewChild } from '@angular/core';
import { LatLngExpression } from "leaflet";
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(MapComponent) map: MapComponent;
  public mapDisabled = true;
  title = 'map-component';

  public ngOnInit(): void {
    this.setBounds()
  }

  private setBounds(markerArray: LatLngExpression[] = []): void {
    this.map.setBounds(markerArray);
  }

}
