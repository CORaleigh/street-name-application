import { useEffect, useRef } from "react";
import { addPin } from "../../utils/location";

export const useMapModal = (closed, open, feature) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (open && mapRef.current?.view) {
      setTimeout(() => {
        mapRef.current.view.goTo({ target: feature, zoom: 16 });
        addPin(feature, mapRef.current.view);
      }, 1500);
    }
  }, [feature, mapRef, open]);
  return { mapRef }
}