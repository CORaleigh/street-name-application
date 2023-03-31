import { CalciteButton, CalciteModal } from "@esri/calcite-components-react";
import StreetTypeList from "./StreetTypeList";

function StreetTypesModal(props) {
  return (
    <CalciteModal
      open={props.open ? true : undefined}
      aria-labelledby="street-types-title"
      id="street-types-modal"
      onCalciteModalClose={() => props.closed()}
    >
      <div slot="header" id="street-types-title">
        Street Types
      </div>
      <div slot="content">
        <StreetTypeList></StreetTypeList>
      </div>
      <CalciteButton slot="primary" onClick={() => props.closed()}>
        Dismiss
      </CalciteButton>
    </CalciteModal>
  );
}

export default StreetTypesModal;
