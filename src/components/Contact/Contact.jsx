import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
  CalcitePanel,
} from "@esri/calcite-components-react";
import { inputChanged } from "../../utils/form";
import PropTypes from "prop-types";

function Contact({ fields, updated, nextStep }) {
  return (
    <CalcitePanel>
      {fields.map((f, i) => (
        <CalciteLabel scale="l" key={`${f.name}_${i}`}>
          {f.alias}
          <CalciteInput
            scale="l"
            onCalciteInputInput={(e) => {
              updated(inputChanged(e, i, fields));
            }}
            value={f.value}
            placeholder={f.placeholder}
            status={f.valid ? "valid" : "invalid"}
            clearable
            type={f.name.includes("email") ? "email" : "text"}
            maxLength={f.length}
          ></CalciteInput>
          {!f.valid && (
            <CalciteInputMessage
              scale="l"
              status={f.valid ? "valid" : "invalid"}
            >
              {f.reason}
            </CalciteInputMessage>
          )}
        </CalciteLabel>
      ))}
      <CalciteButton
        appearance="outline"
        slot="footer-start"
        width="full"
        onClick={() => nextStep("Instructions")}
        iconStart="arrow-left"
        scale="l"
      >
        Back
      </CalciteButton>
      <CalciteButton
        width="full"
        slot="footer-end"
        onClick={() => nextStep("Project Location")}
        disabled={
          fields.filter((f) => f.valid === false).length ? true : undefined
        }
        iconEnd="arrow-right"
        scale="l"
      >
        Next
      </CalciteButton>
    </CalcitePanel>
  );
}

Contact.propTypes = {
  fields: PropTypes.any,
  updated: PropTypes.any,
  nextStep: PropTypes.any,
};

export default Contact;
