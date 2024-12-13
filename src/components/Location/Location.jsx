import { CalciteButton, CalciteLink, CalciteNotice, CalcitePanel } from "@esri/calcite-components-react";

import PropTypes from "prop-types";
import { useLocation } from "./useLocation";
import { ArcgisMap, ArcgisSearch } from "@arcgis/map-components-react";
import { config } from "../../config";
import { handleViewReady, searchSources } from "../../utils/location";

function Location({ screenshotSet, locationSet, nextStep }) {
  const { mapRef, searchRef, locationFound, handleNextClick, handleSearchComplete, handleViewClick } = useLocation(
    screenshotSet,
    locationSet,
    nextStep
  );
  return (
    <CalcitePanel>
      <CalciteNotice
        open
        kind={locationFound.valid ? "success" : "danger"}
        icon={locationFound.valid ? "check-circle-f" : "x-octagon-f"}
      >
        <div slot="message">{locationFound.reason}</div>
        {locationFound.link && <CalciteLink slot="link" title="Go To Website" href={locationFound.link} target="_self">Go To Website</CalciteLink>}
      </CalciteNotice>
      <ArcgisMap ref={mapRef} itemId={config.webMapId} onArcgisViewReadyChange={handleViewReady} onArcgisViewClick={handleViewClick}>
        <ArcgisSearch 
          ref={searchRef}
          position="top-right"
          includeDefaultSourcesDisabled
          sources={searchSources}
          onArcgisComplete={handleSearchComplete}
        ></ArcgisSearch>
      </ArcgisMap>
      <CalciteButton
        appearance="outline"
        slot="footer-start"
        width="full"
        onClick={() => nextStep("Contact Info")}
        iconStart="arrow-left"
        scale="l"
      >
        Back
      </CalciteButton>
      <CalciteButton
        slot="footer-end"
        width="full"
        onClick={handleNextClick}
        disabled={locationFound.valid ? undefined : ""}
        iconEnd="arrow-right"
        scale="l"
      >
        Next
      </CalciteButton>
    </CalcitePanel>
  );
}
Location.propTypes = {
  nextStep: PropTypes.func,
  screenshotSet: PropTypes.func,
  locationSet: PropTypes.func,
};

export default Location;
