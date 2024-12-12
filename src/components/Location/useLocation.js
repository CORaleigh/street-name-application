import { useEffect, useState, useRef } from "react";
import { loadMap, loadSearch, searchComplete } from "../../utils/location";

export const useLocation = (screenshotSet, locationSet, nextStep) => {

  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationFound, setLocationFound] = useState({
    valid: false,
    reason:
      "Location not set, search by address in the upper right corner of the map",
  });
  const handleNextClick = () => nextStep("Project Details");
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
            screenshotSet,
            locationSet
          )
        );
      }
    })();
  }, []);
  return { mapRef, mapLoaded, locationFound, handleNextClick };

}