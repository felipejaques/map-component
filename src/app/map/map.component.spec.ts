import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { Marker } from "leaflet";
import { MapComponent } from "./map.component";


describe("MapComponent", () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [LeafletModule],
            declarations: [MapComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should insert a marker in the map", () => {
        component.addSampleMarker();
        expect(component.map.hasLayer(component.marker)).toBeTruthy();
    });

    it("should alter marker latitude and longitude", () => {
        component.changeMarkerLatLng(1, 1);
        expect(component.marker.getLatLng().lat).toEqual(1);
        expect(component.marker.getLatLng().lng).toEqual(1);
    });

    it("should alter the map view", () => {
        component.focusOn(1, 1);
        expect(component.map.getCenter().lat).toEqual(1);
        expect(component.map.getCenter().lng).toEqual(1);
    });

    it("should add marker", () => {
        component.changeMarkerLatLng(1, 1);
        component.addLayers(1, 1, 10, "test", "test.png", "test2x.png");
        expect(component.marker.getLatLng().lat).toEqual(1);
        expect(component.marker.getLatLng().lng).toEqual(1);
    });

    it("should remove marker if change lat and lng", () => {
        component.addSampleMarker();
        const marker = new Marker([1, 1]);
        component.map.addLayer(marker);
        component.changeMarkerLatLng(1, 1);
        expect(marker).not.toEqual(component.marker);
    });
});
