import { CalciteButton, CalciteNotice } from "@esri/calcite-components-react";

import PropTypes from "prop-types";
import { useLocation } from "./useLocation";

function Location({screenshotSet, locationSet, nextStep}) {
  const { mapRef, locationFound, handleNextClick } = useLocation(screenshotSet, locationSet, nextStep);
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
        onClick={handleNextClick}
        disabled={locationFound.valid ? undefined : ""}
        iconEnd="arrow-right"
        scale="l"
      >
        Next
      </CalciteButton>
    </>
  );
}
Location.propTypes = {
  nextStep: PropTypes.func,
  screenshotSet: PropTypes.func,
  locationSet: PropTypes.func
};

export default Location;
