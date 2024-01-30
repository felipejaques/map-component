import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Circle, icon, latLng, latLngBounds, LatLngExpression, Map as LeafletMap, MapOptions, Marker, tileLayer } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/images/marker-shadow.png";
import { IconsConstants } from "./icons-constants";

@Component({
    selector: "app-map",
    templateUrl: "./map.component.html",
    styleUrls: ["./map.component.css"]
})
export class MapComponent implements OnInit {
    private readonly decimalNumberConverter = 10;
    private readonly defaultMapHeight = 382;
    @Input() public height = this.defaultMapHeight;
    @Input() public isDisabled: boolean;
    @Input() public readonly = false;
    @Input() public showCircleMarker: boolean;
    @Input() public pin: string = IconsConstants.ICON;
    @Input() public pin2x: string = IconsConstants.ICON_2X;
    @Output() public notifyInit = new EventEmitter<any>();
    public mapOptions: MapOptions;
    public map: LeafletMap;
    public marker: Marker;
    public circle: Circle;
    public readonly latDefault = -10.3333333;
    public readonly lngDefault = -53.2;
    public readonly zoomDefault = 18;

    constructor() { }

    ngOnInit() {
        this.initializeMapOptions();
    }

    private initializeMapOptions() {
        this.mapOptions = {
            center: latLng(this.latDefault, this.lngDefault),
            zoom: 3,
            layers: [
                tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: this.zoomDefault
                })
            ]
        };
    }

    public setBounds(markerArray: LatLngExpression[]) {
        this.map.fitBounds(latLngBounds(markerArray));
    }

    public onMapReady(map: LeafletMap) {
        const timeout100 = 100;
        this.map = map;
        if (!this.isDisabled && !this.readonly && this.map) {
            const provider = new OpenStreetMapProvider();
            this.map.addControl(
                GeoSearchControl({
                    provider,
                    position: "topleft",
                    autoClose: false,
                    searchLabel: "Procure o endereço",
                    showPopup: true,
                    maxMarkers: 1,
                    marker: {
                        icon: this.createIcon(this.pin, this.pin2x),
                        draggable: true
                    }
                })
            );
            if (this.showCircleMarker) {
                this.addSampleCircle();
            }
        }
        this.addSampleMarker();
        setTimeout(() => {
            this.notifyInit.emit();
            this.map.invalidateSize();
        }, timeout100);
    }

    public addSampleMarker() {
        this.marker = new Marker([this.latDefault, this.lngDefault], {
            draggable: !this.readonly,
            icon: this.createIcon(this.pin, this.pin2x)
        });
        this.map.addLayer(this.marker);
    }

    public changeMarkerLatLng(lat: number, lng: number) {
        if (lat && lng) {
            this.map.eachLayer(layer => {
                if (layer instanceof Marker && layer === this.marker) {
                    layer.setLatLng([lat, lng]);
                } else if (layer instanceof Marker) {
                    this.map.removeLayer(layer);
                }
            });
            this.map.setView(latLng(lat, lng), this.zoomDefault);
            this.map.invalidateSize();
        }
    }

    public removeAllMarker(): void {
        this.map.eachLayer(layer => {
            if (layer instanceof Marker) {
                this.map.removeLayer(layer);
            }
        });
    }

    public setCircleLatLng(lat: number, lng: number, radius: number) {
        if (lat && lng) {
            if (this.circle) {
                this.map.removeLayer(this.circle);
            }
            this.circle = new Circle(latLng(lat, lng), {
                radius,
                color: "#428bca"
            });
            this.map.addLayer(this.circle);
        }
    }

    public addSampleCircle() {
        this.circle = new Circle(latLng(this.latDefault, this.lngDefault), {
            radius: 10,
            color: "#428bca"
        });
        this.map.addLayer(this.circle);
    }

    public addLayers(lat: number, lng: number, radius: number, popupName: string, pin: string, pin2x: string) {
        this.addCircle(radius, lat, lng);
        this.addMarker(lat, lng, popupName, pin, pin2x);
    }

    private addCircle(radius: number, lat: number, lng: number) {
        if (radius) {
            const circle = new Circle(latLng(lat, lng), {
                radius,
                color: "#428bca"
            });
            this.map.addLayer(circle);
        }
    }

    private addMarker(lat: number, lng: number, popupName: string, pin: string, pin2x: string) {
        if (lat != null && lng != null) {
            const marker = new Marker([lat, lng], {
                draggable: false,
                icon: this.createIcon(pin, pin2x)
            });
            if (popupName) {
                popupName = `<div style='background:black; color: white; padding: 4px;'>${popupName}</div>`;
                marker.bindTooltip(popupName, { opacity: 0.8 });
            }

            this.map.addLayer(marker);
        }
    }

    private createIcon(pin: string = IconsConstants.ICON, pin2x: string = IconsConstants.ICON_2X) {
        return icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: pin,
            iconRetinaUrl: pin2x,
            shadowUrl: "assets/marker-shadow.png"
        });
    }

    public focusOn(lat: number, lng: number) {
        this.map.setView(latLng(lat, lng), this.zoomDefault);
    }

    public latLngChange(formGroup: FormGroup): void {
        const lat = formGroup.get("latitude").value;
        const lng = formGroup.get("longitude").value;
        const radius = formGroup.get('radius').value;
        this.latChange(lat, formGroup);
        this.lngChange(lng, formGroup);
        this.changeMarkerLatLng(lat, lng);
        this.setCircleLatLng(lat, lng, radius);
    }

    private latChange(lat: number, formGroup: FormGroup) {
        const minLatitude = -90;
        const maxLatitude = 90;
        if (lat && !Number.isInteger(lat)) {
            formGroup.patchValue({ latitude: this.truncateLocation(lat) });
        }
        if (lat && Number.isInteger(lat) && (lat > maxLatitude || lat < minLatitude)) {
            formGroup.patchValue({ latitude: lat / this.decimalNumberConverter });
        }
    }

    private lngChange(lng: number, formGroup: FormGroup) {
        const minLongitude = -180;
        const maxLongitude = 180;
        if (lng && !Number.isInteger(lng)) {
            formGroup.patchValue({ longitude: this.truncateLocation(lng) });
        }
        if (lng && Number.isInteger(lng) && (lng > maxLongitude || lng < minLongitude)) {
            formGroup.patchValue({ longitude: lng / this.decimalNumberConverter });
        }
    }

    private truncateLocation (location: number): number {
      const precision = 7
      return (
          Math.floor(location * Number("1".padEnd(precision + 1, "0"))) /
          Number("1".padEnd(precision + 1, "0"))
      );
  };
  
}

