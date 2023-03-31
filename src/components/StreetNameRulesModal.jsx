import { CalciteButton, CalciteModal } from "@esri/calcite-components-react";
import StreetNameRules from "./StreetNameRules";

function StreetNameRulesModal(props) {
  return (
    <CalciteModal
      open={props.open ? true : undefined}
      aria-labelledby="street-rules-title"
      id="street-rules-modal"
      onCalciteModalClose={() => props.closed()}
    >
      <div slot="header" id="street-rules-title">
        Street Name Rules
      </div>
      <div slot="content">
        <StreetNameRules></StreetNameRules>
      </div>
      <CalciteButton slot="primary" onClick={() => props.closed()}>
        Dismiss
      </CalciteButton>
    </CalciteModal>
  );
}

export default StreetNameRulesModal;
