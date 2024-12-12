import { useEffect, useRef, useState } from "react";
import { loadMap, addPin } from "../../utils/location";

export const useMapModal = (closed, open, feature) => {
    const mapRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [mapView, setMapView] = useState();
    useEffect(() => {
      if (!loaded) {
        (async () => {
          const view = await loadMap(mapRef.current);
          setLoaded(false);
          setMapView(view);
        })();
      }
    }, [loaded]);
  
    useEffect(() => {
      if (open && mapView) {
        setTimeout(() => {
          mapView.goTo({ target: feature, zoom: 16 });
          addPin(feature, mapView);
        }, 1500);
      }
    }, [feature, mapView, open]);
    return { mapRef }
}