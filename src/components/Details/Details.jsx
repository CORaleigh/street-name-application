import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
} from "@esri/calcite-components-react";
import { inputChanged } from "../../utils/form";
import Attachments from "../Attachments/Attachments";
import PropTypes from "prop-types";

function Details({fields, updated, screenshotRef, nextStep, attachments}) {
  return (
    <>
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
            type={f.type.includes("integer") ? "number" : "text"}
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
      <CalciteLabel scale="l">
        <form></form>
      </CalciteLabel>
      <Attachments
        attachments={attachments}
        screenshotRef={screenshotRef}
      ></Attachments>
      <CalciteButton
        onClick={() => nextStep("Street Names")}
        disabled={
          fields.filter((f) => f.valid === false).length
            ? true
            : undefined
        }
        iconEnd="arrow-right"
        scale="l"
      >
        Next
      </CalciteButton>
    </>
  );
}
Details.propTypes = {
  fields: PropTypes.any, // Replace `any` with the actual type if known
  updated: PropTypes.any,
  screenshotRef: PropTypes.any,
  nextStep: PropTypes.any,
  attachments: PropTypes.any,

};
export default Details;
