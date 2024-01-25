import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
} from "@esri/calcite-components-react";
import { inputChanged } from "./utils/form";

function Contact(props) {
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
        onClick={() => props.nextStep("Project Location")}
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

export default Contact;
