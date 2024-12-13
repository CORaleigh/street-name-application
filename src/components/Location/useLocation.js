import { useState, useRef } from "react";
import { checkJurisdiction, checkParcel } from "../../utils/location";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

export const useLocation = (screenshotSet, locationSet, nextStep) => {

  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const [locationFound, setLocationFound] = useState({
    valid: false,
    reason:
      "Location not set, search by address in the upper right corner of the map",
  });
  const handleNextClick = () => nextStep("Project Details");
  const handleViewClick = (e) => {

    searchRef.current.search(e.detail.mapPoint);
  }
  const handleSearchComplete = async (e) => {
    const view = e.target.view
    const feature = e.detail.results[0].results[0]?.feature;
    feature.setAttribute("Postal", feature.getAttribute("Postal"));
    feature.setAttribute("address", feature.getAttribute("ShortLabel"));
    let success = await checkJurisdiction(feature?.geometry);
    if (success.valid) {
      let hitTest = await checkParcel(feature, view);
      if (hitTest.results.length) {
        feature.setAttribute(
          "pinnum",
          hitTest.results[0].graphic.getAttribute("PIN_NUM")
        );

        locationSet(feature);
          await reactiveUtils.whenOnce(() => view.updating === false );
          const screenshot = await view.takeScreenshot({ width: 1048, height: 586 });
          screenshotSet(screenshot);

        success = {
          valid: true,
          reason: `Location set to ${feature.getAttribute("address")}`,
        };
      } else {
        success = {
          valid: false,
          reason: "Address not located on a property",
        };
        locationSet(undefined);
      }

    }
    setLocationFound(success);
  }
  return { mapRef, searchRef, locationFound, handleNextClick, handleSearchComplete, handleViewClick };

}