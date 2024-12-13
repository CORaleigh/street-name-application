import {
  CalciteButton,
  CalciteDialog,
  CalciteLink,
  CalcitePanel
} from "@esri/calcite-components-react";
import StreetNameRules from "../StreetNameRules/StreetNameRules";
import StreetTypeList from "../StreetTypeList/StreetTypeList";
import PropTypes from "prop-types";
import { useIntro } from "./useIntro";

function Intro({ stepChanged, nextStep, agreed }) {
  const { showModal, toggleModal, handleAgree } = useIntro(
    stepChanged,
    nextStep,
    agreed
  );

  return (
    <>
      <CalcitePanel heading="Guidelines for Selecting Street Names">
      <p>
          After submitting a street name application, City staff will review each of the street names submitted.  If not enough street names are approved, you will receive an email asking for additional street names to be submitted.  After the City has approved the application, County staff will perform a final review.  Once approved by the County, you will receive a copy with a digital signature.
        </p>
        <p>
          City and County staff will determine whether the names submitted in
          this application are acceptable. Please consider the following
          guidelines when selecting your possible road names:
        </p>
        <p>
          <CalciteButton
            appearance="outline-fill"
            onClick={() => toggleModal("rules")}
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
            onClick={() => toggleModal("types")}
          >
            View Street Types
          </CalciteButton>
        </p>
        <p>
          Have questions? Addressing staff is available at{" "}
          <CalciteLink
            href="mailto:RaleighAddressing@raleighnc.gov?subject=Street Name Application Inquiry"
            iconStart="envelope"
          >
            RaleighAddressing@raleighnc.gov
          </CalciteLink>
          .{" "}

        </p>
        <h4>
           Have you read and agree to the above guidelines?
          </h4>
        
        
        <CalciteButton
          onClick={handleAgree}
          iconEnd="check"
          width="full"
          scale="l"

        >
          I Agree
        </CalciteButton>
      </CalcitePanel>
      <CalciteDialog
        heading={
          showModal.rules
            ? "Street Name Rules"
            : showModal.types
            ? "Street Type List"
            : ""
        }
        open={showModal.rules || showModal.types}
        aria-labelledby="modal-title"
        id="intro-modal"
      >
        {showModal.rules && <StreetNameRules />}
        {showModal.types && <StreetTypeList />}
      </CalciteDialog>
    </>
  );
}

Intro.propTypes = {
  stepChanged: PropTypes.any,
  nextStep: PropTypes.func,
  agreed: PropTypes.func,
};

export default Intro;
