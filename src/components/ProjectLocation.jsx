import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
  CalciteNotice,
} from "@esri/calcite-components-react";
import { useEffect, useState, useRef } from "react";
import { loadMap } from "./utils/map";

function ProjectLocation(props) {
  const mapRef = useRef(null);
  const [locationFound, setLocationFound] = useState({
    valid: false,
    reason:
      "Location not set, search by address in the upper right corner of the map",
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [location, setLocation] = useState(undefined);

  useEffect(() => {
    (async () => {
      if (!mapLoaded) {
        await loadMap(
          mapRef.current,
          setLocation,
          setLocationFound,
          props.locationSet,
          props.screenshotSet
        );
        setMapLoaded(true);
      }
    })();
  }, []);
  return (
    <div>
      <CalciteNotice
        open
        kind={locationFound.valid ? "success" : "danger"}
        icon={locationFound.valid ? "check-circle-f" : "x-octagon-f"}
      >
        <div slot="message">{locationFound.reason}</div>
      </CalciteNotice>
      <div ref={mapRef}></div>
      <CalciteButton
        scale="l"
        disabled={location !== undefined ? undefined : true}
        onClick={(e) => {
          props.nextStep("Project Details");
        }}
      >
        Next
      </CalciteButton>
    </div>
  );
}

export default ProjectLocation;
