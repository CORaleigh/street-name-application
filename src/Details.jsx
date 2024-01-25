import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
} from "@esri/calcite-components-react";
import { inputChanged } from "./utils/form";
import Attachments from "./Attachments";

function Details(props) {
  return (
    <>
      {props.fields.map((f, i) => (
        <CalciteLabel scale="l" key={`${f.name}_${i}`}>
          {f.alias}
          <CalciteInput
            scale="l"
            onCalciteInputInput={(e) => {
              props.updated(inputChanged(e, i, props.fields));
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
        attachments={props.attachments}
        screenshotRef={props.screenshotRef}
      ></Attachments>
      <CalciteButton
        onClick={() => props.nextStep("Street Names")}
        disabled={
          props.fields.filter((f) => f.valid === false).length
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

export default Details;
