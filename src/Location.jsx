import { CalciteButton, CalciteNotice } from "@esri/calcite-components-react";
import { useEffect, useRef, useState } from "react";
import { loadMap, loadSearch, searchComplete } from "./utils/location";

function Location(props) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationFound, setLocationFound] = useState({
    valid: false,
    reason:
      "Location not set, search by address in the upper right corner of the map",
  });
  useEffect(() => {
    (async () => {
      if (!mapLoaded) {
        const view = await loadMap(mapRef.current);
        setMapLoaded(true);
        const search = await loadSearch(view);
        view.ui.add(search, "top-right");
        view.on("click", (e) => {
          search.search(e.mapPoint);
        });
        search.on("search-complete", (e) =>
          searchComplete(
            e,
            view,
            setLocationFound,
            props.screenshotSet,
            props.locationSet
          )
        );
      }
    })();
  }, []);

  return (
    <>
      <CalciteNotice
        open
        kind={locationFound.valid ? "success" : "danger"}
        icon={locationFound.valid ? "check-circle-f" : "x-octagon-f"}
      >
        <div slot="message">{locationFound.reason}</div>
      </CalciteNotice>
      <div ref={mapRef}></div>
      <CalciteButton
        width="full"
        onClick={() => props.nextStep("Project Details")}
        disabled={locationFound.valid ? undefined : ""}
        iconEnd="arrow-right"
        scale="l"
      >
        Next
      </CalciteButton>
    </>
  );
}

export default Location;
