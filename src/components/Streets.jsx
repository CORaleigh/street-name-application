import {
    CalciteCard,
    CalciteLabel,
    CalciteInput,
    CalciteInputMessage,
    CalciteIcon,
    CalciteSelect,
    CalciteOption
  } from "@esri/calcite-components-react";
import { useEffect } from "react";
import useStreets from "./utils/useStreets";


  function Streets(props) {
    const {
      streets,
      setStreets,
      streetTypes,
      streetNameChanged,
      streetTypeChanged,
    } = useStreets(props);    
    useEffect(() => {
      setStreets(props.streets);
    },[props.streets])
    return (
     <div>
{streets.map((street, i) => {
              return (
                <CalciteCard key={i + 1}>
                  <span slot="title">Street {i + 1}</span>
                  <CalciteLabel scale="l">
                    Street Name
                    <div className="street">
                      <CalciteInput
                        scale="l"
                        maxLength={20}
                        onCalciteInputChange={async (e) => {
                          e.target.setAttribute("clearable", true);
                          const streets = await streetNameChanged(e, i);
                          setStreets(streets);
                          props.streetsUpdated(streets);

                        }}
                        onCalciteInputInput={(e) =>
                          e.target.setAttribute("clearable", true)
                        }
                        value={street.name.value}
                        status={street.name.valid ? "valid" : "invalid"}
                      ></CalciteInput>
                      <CalciteIcon
                        icon="information"
                        onClick={(_) => setShowStreetNameRules(true)}
                      ></CalciteIcon>
                    </div>
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
                  {street.type && (
                    <CalciteLabel scale="l">
                      Street Type
                      <div className="street">
                        <CalciteSelect
                          scale="l"
                          onCalciteSelectChange={async (e) => {
                            const streets = await streetTypeChanged(e, i);
                            setStreets(streets);
                            props.streetsUpdated(streets);                            
                          }}
                        >
                          {streetTypes.map((type) => (
                            <CalciteOption key={type.code} value={type.code}>
                              {type.name}
                            </CalciteOption>
                          ))}
                        </CalciteSelect>

                        <CalciteIcon
                          icon="information"
                          onClick={() => setShowStreetTypes(true)}
                        ></CalciteIcon>
                      </div>
                      {street.type.valid === false && (
                        <CalciteInputMessage
                          scale="l"
                          status={street.type.valid ? "valid" : "invalid"}
                        >
                          {street.type.reason}
                        </CalciteInputMessage>
                      )}
                    </CalciteLabel>
                  )}
                </CalciteCard>
              );
            })}      
     </div>
    );
  }
  
  export default Streets;
  