import { CalciteButton, CalciteDialog, CalciteLink } from "@esri/calcite-components-react";
import StreetNameRules from "../StreetNameRules/StreetNameRules";
import StreetTypeList from "../StreetTypeList/StreetTypeList";
import PropTypes from "prop-types";
import { useIntro } from "./useIntro";

function Intro({ stepChanged, nextStep, agreed }) {
  const {showModal, toggleModal, handleAgree } = useIntro(stepChanged, nextStep, agreed)

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
        <p>Have questions?  Addressing staff is available at <CalciteLink href="mailto:RaleighAddressing@raleighnc.gov?subject=Street Name Application Inquiry" iconStart="envelope">
        
        RaleighAddressing@raleighnc.gov
        </CalciteLink>. </p>
        <strong>Have you read and agree to the above guidelines?</strong>
        <br />
        <br />
        <CalciteButton
          onClick={handleAgree}
          iconEnd="check"
          width="full"
          scale="l"
        >
          I Agree
        </CalciteButton>
      </div>
      <CalciteDialog
        heading={showModal.rules ? 'Street Name Rules' : showModal.types ? 'Street Type List' : ''}
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
  stepChanged: PropTypes.any, // Replace `any` with the actual type if known
  nextStep: PropTypes.func,
  agreed: PropTypes.func,
};

export default Intro;
