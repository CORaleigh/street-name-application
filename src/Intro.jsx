import { CalciteButton, CalciteModal } from "@esri/calcite-components-react";
import StreetNameRules from "./StreetNameRules";
import StreetTypeList from "./StreetTypeList";
import { useEffect, useState } from "react";

function Intro(props) {
  const [showRules, setShowRules] = useState(false);
  const [showStreetTypes, setShowStreetTypes] = useState(false);
  useEffect(() => {
    setShowRules(false);
    setShowStreetTypes(false);
  }, [props.stepChanged]);
  return (
    <>
      <div className="intro">
        <h3>GUIDELINES FOR SELECTING STREET NAMES</h3>
        <strong>
          Submitting this application does not mean all of the streets will be
          approved. City and County staff will further review the streets and
          reach out if more streets are needed or if changes need to be made.
        </strong>
        <br />
        <p>
          City and County staff will determine whether the names submitted in
          this application are acceptable. Please consider the following
          guidelines when selecting your possible road names:
        </p>
        <p>
          <CalciteButton
            appearance="outline-fill"
            onClick={() => {
              setShowRules((prev) => !prev);
              setShowStreetTypes(false);
            }}
          >
            View Street Name Rules
          </CalciteButton>
        </p>
        <p>
          The following street type definitions should be used when selecting
          possible street names to better the chances of submitting an
          approvable street name:
        </p>
        <p>
          <CalciteButton
            appearance="outline-fill"
            onClick={() => {
              setShowStreetTypes((prev) => !prev);
              setShowRules(false);
            }}
          >
            View Street Types
          </CalciteButton>
        </p>
        <strong>Have you read and agree to the above guidelines?</strong>
        <br />
        <br />
        <CalciteButton
          onClick={() => {
            props.nextStep("Contact Info");
            props.agreed();
            setShowRules(false);
            setShowStreetTypes(false);
          }}
          iconEnd="check"
          width="full"
          scale="l"
        >
          I Agree
        </CalciteButton>
      </div>
      <CalciteModal
        open={showRules || showStreetTypes}
        aria-labelledby="modal-title"
        id="intro-modal"
      >
        <div slot="header" id="modal-title">
          {showRules
            ? "Street Name Rules"
            : showStreetTypes
            ? "Street Type List"
            : undefined}
        </div>
        <div slot="content">
          {showRules && <StreetNameRules></StreetNameRules>}
          {showStreetTypes && <StreetTypeList></StreetTypeList>}
        </div>
      </CalciteModal>
    </>
  );
}

export default Intro;
