import {
  CalciteButton,
  CalciteModal,
} from "@esri/calcite-components-react";
import { useEffect, useRef, useState } from "react";
import { loadMap } from "./utils/location";

function MapModal(props) {
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
  }, []);

  useEffect(() => {
    if (props.open && mapView) {
      setTimeout(() => {
        mapView.goTo({ target: props.feature, zoom: 16 });
      }, 1500);
    }
  }, [props.open]);

  return (
    <CalciteModal
      open={props.open ? true : undefined}
      aria-labelledby="modal-title"
      id="success-modal"
      onCalciteModalClose={(_) => {
        props.closed();
      }}
      fullscreen
    >
      <div slot="header" id="modal-title">{props?.feature?.getAttribute('address')}</div>
      <div slot="content" className="map-content">
        <div ref={mapRef}></div>
      </div>
      <CalciteButton width="full" slot="primary" onClick={(_) => props.closed()}>
        Dismiss
      </CalciteButton>
    </CalciteModal>
  );
}

export default MapModal;
