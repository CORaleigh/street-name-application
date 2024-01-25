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
} from "@esri/calcite-components-react";
import { useEffect, useState } from "react";
import {
  loadStreetTypes,
  streetNameChanged,
  streetTypeChanged,
} from "./utils/streets";

function Streets(props) {
  const [streets, setStreets] = useState([
    {
      name: { value: null, valid: false, reason: "Street name required" },
      type: { value: null, valid: false, reason: "Street type required" },
    },
  ]);
  const [streetTypes, setStreetTypes] = useState([
    {
      name: "Select street type...",
      code: null,
    },
  ]);
  const [streetTypesLoaded, setStreetTypesLoaded] = useState(false);
  const deleteStreet = (elementToRemove) => {
    setStreets((prev) => {
      const newStreets = prev.filter((street) => street !== elementToRemove);
      console.log(prev);
      console.log(newStreets);
      return newStreets;
    });
  };
  const getAlertKind = () => {
    const validCnt = streets.filter((s) => s.name.valid && s.type.valid).length;
    const neededCnt = parseInt(props.needed);
    if (validCnt < neededCnt) {
      return "danger";
    } else if (validCnt > neededCnt) {
      return "success";
    } else {
      return "warning";
    }
  };
  const getAlertMessage = () => {
    const validCnt = streets.filter((s) => s.name.valid && s.type.valid).length;
    const neededCnt = parseInt(props.needed);
    if (validCnt < neededCnt) {
      return `${validCnt} valid ${
        validCnt === 1 ? "street" : "streets"
      } entered, ${neededCnt - validCnt} more needed`;
    } else if (validCnt > neededCnt) {
      return `${validCnt} valid ${
        validCnt === 1 ? "street" : "streets"
      } entered, 0 more needed`;
    } else {
      return `${validCnt} valid ${
        validCnt === 1 ? "street" : "streets"
      } entered, it is recommended to enter more than needed`;
    }
  };
  useEffect(() => {
    (async () => {
      if (!streetTypesLoaded) {
        setStreetTypes([...streetTypes, ...(await loadStreetTypes())]);
        setStreetTypesLoaded(true);
      }
    })();
  }, []);
  useEffect(() => {
    const newStreets = [];
    if (props.needed > streets.length) {
      for (var i = 0; i < props.needed - streets.length; i++) {
        newStreets.push({
          name: { value: null, valid: false, reason: "Street name required" },
          type: { value: null, valid: false, reason: "Street type required" },
        });
      }
    }
    setStreets((prev) => [...streets, ...newStreets]);
  }, [props.needed]);
  return (
    <>
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
                  onCalciteInputInput={async (e) => {
                    e.target.setAttribute("clearable", true);
                    const updatedStreets = await streetNameChanged(
                      e,
                      i,
                      streets,
                      streetTypes
                    );
                    setStreets(updatedStreets);
                    //props.streetsUpdated(streets);
                  }}
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
                  onCalciteSelectChange={async (e) => {
                    const updatedStreets = await streetTypeChanged(
                      e,
                      i,
                      streets
                    );
                    setStreets(updatedStreets);
                    //props.streetsUpdated(streets);
                  }}
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
              <CalciteFab
                icon="trash"
                kind="danger"
                appearance="outline-fill"
                onClick={() => deleteStreet(street)}
              ></CalciteFab>
            </div>
          </CalciteCard>
        ))}
        <CalciteFab
          icon="plus"
          kind="brand"
          appearance="outline-fill"
          onClick={() =>
            setStreets((prev) => [
              ...prev,
              {
                name: {
                  value: null,
                  valid: false,
                  reason: "Street name required",
                },
                type: {
                  value: null,
                  valid: false,
                  reason: "Street type required",
                },
              },
            ])
          }
        ></CalciteFab>

        <CalciteButton
          width="full"
          onClick={() => props.submit(streets)}
          disabled={
            streets.filter((s) => s.name.valid && s.type.valid).length >=
            parseInt(props.needed)
              ? undefined
              : ""
          }
          iconEnd="submit"
        >
          Submit
        </CalciteButton>

        <CalciteNotice className="street-notice" kind={getAlertKind()} open>
          <div slot="message">{getAlertMessage()}</div>
        </CalciteNotice>
      </div>
    </>
  );
}

export default Streets;
