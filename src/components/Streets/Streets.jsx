import {
  CalciteButton,
  CalciteCard,
  CalciteFab,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
  CalciteOption,
  CalciteSelect,
  CalciteNotice,
  CalciteAction,
  CalcitePanel,
} from "@esri/calcite-components-react";

import PropTypes from "prop-types";
import { useStreets } from "./useStreets";

function Streets({ needed, submit, nextStep }) {
  const {
    streets,
    streetTypes,
    addStreet,
    deleteStreet,
    getAlertMessage,
    getAlertKind,
    handleSubmitClick,
    handleStreetNameInput,
    handleStreetTypeSelect,
  } = useStreets(needed, submit);

  return (
    <>
        <CalcitePanel>
    
      <div className="streets-container">
        {streets.map((street, i) => (
          <CalciteCard key={i + 1}>
            {/* <span slot="title">Street {i + 1}</span> */}
            <div className="street-row">
              <CalciteLabel scale="l">
                Street Name
                <CalciteInput
                  scale="l"
                  value={street.name.value}
                  onCalciteInputInput={handleStreetNameInput}
                  data-index={i}
                ></CalciteInput>
                <CalciteInputMessage
                  scale="l"
                  icon={
                    !street.name.valid
                      ? "x-octagon-f"
                      : street.name.valid && street.name.reason
                      ? "exclamation-mark-triangle-f"
                      : undefined
                  }
                  status={street.name.valid ? "valid" : "invalid"}
                >
                  {street.name.reason}
                </CalciteInputMessage>
              </CalciteLabel>
              <CalciteLabel scale="l">
                Street Type
                <CalciteSelect
                  scale="l"
                  value={street.type.value}
                  onCalciteSelectChange={handleStreetTypeSelect}
                  data-index={i}
                >
                  {streetTypes.map((type) => (
                    <CalciteOption key={type.code} value={type.code}>
                      {type.name}
                    </CalciteOption>
                  ))}
                </CalciteSelect>
                <CalciteInputMessage
                  scale="l"
                  icon={
                    !street.type.valid
                      ? "x-octagon-f"
                      : street.type.valid && street.type.reason
                      ? "exclamation-mark-triangle-f"
                      : undefined
                  }
                  status={street.type.valid ? "valid" : "invalid"}
                >
                  {street.type.reason}
                </CalciteInputMessage>
              </CalciteLabel>
              <CalciteAction
                slot="actions-end"
                icon="trash"
                appearance="outline-fill"
                onClick={() => deleteStreet(street)}
              ></CalciteAction>
            </div>
          </CalciteCard>
        ))}
        <CalciteFab
          icon="plus"
          kind="brand"
          appearance="outline-fill"
          onClick={addStreet}
        ></CalciteFab>
        <CalciteNotice className="street-notice" kind={getAlertKind()} open>
          <div slot="message">{getAlertMessage()}</div>
        </CalciteNotice>



      </div>
      <CalciteButton
        appearance="outline"
        slot="footer-start"
        width="full"
        onClick={() => nextStep("Project Details")}
        iconStart="arrow-left"
        scale="l"
      >
        Back
      </CalciteButton>      
      <CalciteButton
          slot="footer-end"
          width="full"
          scale="l"
          onClick={handleSubmitClick}
          disabled={
            streets.filter((s) => s.name.valid && s.type.valid).length >=
            parseInt(needed)
              ? undefined
              : ""
          }
          iconEnd="submit"
        >
          Submit
        </CalciteButton>
      </CalcitePanel>
    </>
  );
}
Streets.propTypes = {
  needed: PropTypes.any,
  submit: PropTypes.func,
  nextStep: PropTypes.func
};
export default Streets;
