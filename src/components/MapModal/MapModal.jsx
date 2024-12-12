import {
  CalciteButton,
  CalciteDialog,
} from "@esri/calcite-components-react";
import PropTypes from "prop-types";
import { useMapModal } from "./useMapModal";

function MapModal({closed, open, feature}) {
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
      heading={feature?.getAttribute('address')}
    >
      {/* <div slot="content" className="map-content"> */}
        <div ref={mapRef}></div>
      {/* </div> */}
      <CalciteButton width="full" slot="primary" onClick={() => closed()}>
        Dismiss
      </CalciteButton>
    </CalciteDialog>
  );
}
MapModal.propTypes = {
  closed: PropTypes.func, // Replace `any` with the actual type if known
  feature: PropTypes.any,
  open: PropTypes.any,
};
export default MapModal;
