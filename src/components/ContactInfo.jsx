import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
} from "@esri/calcite-components-react";
import { useEffect, useState } from "react";
import { inputChanged } from "./utils/form";

function ContactInfo(props) {
  const [contactFields, setContactFields] = useState([]);

  useEffect(() => {
    if (props.contactFields) {
      setContactFields(props.contactFields);
    }
  }, []);
  return (
    <div>
      {contactFields.map((f, i) => (
        <CalciteLabel scale="l" key={f.name}>
          {f.alias}
          <CalciteInput
            scale="l"
            clearable
            maxLength={f.length}
            type={f.name.includes("email") ? "email" : "text"}
            name={f.name}
            status={f.valid ? "valid" : "invalid"}
            placeholder={f.placeholder}
            onCalciteInputInput={(e) => {
              inputChanged(e, i, contactFields, setContactFields);
            }}
            value={f.value}
            disabled={props.addStreets ? true : undefined}
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
        scale="l"
        disabled={
          contactFields.filter((f) => f.valid === false).length
            ? true
            : undefined
        }
        onClick={() => {
          props.nextStep("Project Location");
        }}
      >
        Next
      </CalciteButton>
    </div>
  );
}

export default ContactInfo;
