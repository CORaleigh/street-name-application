import { CalciteButton, CalciteDialog } from "@esri/calcite-components-react";
import PropTypes from "prop-types";
import { useMapModal } from "./useMapModal";
import { ArcgisMap } from "@arcgis/map-components-react";
import { config } from "../../config";
import { handleViewReady } from "../../utils/location";
function MapModal({ closed, open, feature }) {
  const { mapRef } = useMapModal(closed, open, feature);
  return (
    <CalciteDialog
      modal
      open={open ? true : undefined}
      aria-labelledby="modal-title"
      id="success-modal"
      onCalciteDialogClose={() => {
        closed();
      }}
      fullscreen
      heading={feature?.getAttribute("address")}
    >
      <ArcgisMap ref={mapRef} itemId={config.webMapId} onArcgisViewReadyChange={handleViewReady}></ArcgisMap>
      <CalciteButton width="full" slot="primary" onClick={() => closed()}>
        Dismiss
      </CalciteButton>
    </CalciteDialog>
  );
}
MapModal.propTypes = {
  closed: PropTypes.func,
  feature: PropTypes.any,
  open: PropTypes.any,
};
export default MapModal;
