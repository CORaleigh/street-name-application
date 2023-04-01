import {
  CalciteStepper,
  CalciteStepperItem,
  CalciteButton,
  CalciteScrim
} from "@esri/calcite-components-react";

import { useEffect, useRef, useState } from "react";
import useStreets from "./utils/useStreets";

import "./Form.css";
import { getFields, submitApplication } from "./utils/form";

import Intro from "./Intro";
import ContactInfo from "./ContactInfo";
import ProjectLocation from "./ProjectLocation";
import ProjectDetails from "./ProjectDetails";
import SubmittedModal from "./SubmittedModal";
import StreetTypesModal from "./StreetTypesModal";
import StreetNameRulesModal from "./StreetNameRulesModal";
import Streets from "./Streets";

function Form(props) {
  const [appFields, setAppFields] = useState([]);
  const [contactFields, setContactFields] = useState([]);

  const [selectedStep, setSelectedStep] = useState("Instructions");
  const [success, setSuccess] = useState(false);
  const [showStreetTypes, setShowStreetTypes] = useState(false);
  const [showStreetNameRules, setShowStreetNameRules] = useState(false);
  const [location, setLocation] = useState(undefined);

  const [agree, setAgree] = useState(false);
  const [appWidth, setAppWidth] = useState(window.innerWidth);
  const [screenshot, setScreenshot] = useState();

  const attachments = useRef(null);
  const screenshotRef = useRef(null);
  const [streetsSubmitting, setStreetsSubmitting] = useState(1);

  const {
    streets,
    setStreets,
  } = useStreets(props);

  const stepped = async (step) => {
    setSelectedStep(step);
    if (step === "Instructions") {
      setAgree(false);
    }
    if (step === "Street Names") {
      customElements.whenDefined("calcite-input-message").then(async (_) => {
        document
          .querySelectorAll(
            "calcite-stepper-item[selected] calcite-input-message"
          )
          .forEach((message) => {
            var style = document.createElement("style");
            style.innerHTML =
              ':host([status="valid"]) .calcite-input-message-icon {color: var(--calcite-ui-warning) !important;}';
            message.shadowRoot.appendChild(style);
          });
      });
    }
  };
  useEffect(() => {
    window.addEventListener("resize", (_) => setAppWidth(window.innerWidth));
    (async () => {
      const fields = await getFields("155f0425df84404eb3a9b67cfcbece15");
      setContactFields(
        fields.filter((f) =>
          ["contact", "organization", "email", "phone"].includes(f.name)
        )
      );
      setAppFields(
        fields.filter((f) =>
          [
            "projectname",
            "plannumber",
            "pinnum",
            "address",
            "zipcode",
            "streetnamesneeded",
            "streetnamessubmitting",
          ].includes(f.name)
        )
      );
    })();
  }, []);
  useEffect(() => {
    const updateFields = appFields.map((field, index) => {
      let result = { valid: true, reason: null };
      if (field.name.toLowerCase().includes("address")) {
        field.value =
          location !== undefined ? location.getAttribute("address") : null;
        field.valid = result.valid;
        field.reason = result.reason;
      }
      if (field.name.toLowerCase().includes("zip")) {
        field.value =
          location !== undefined ? location.getAttribute("Postal") : null;
        field.valid = result.valid;
        field.reason = result.reason;
      }
      if (field.name.toLowerCase() === "pinnum") {
        field.value =
          location !== undefined ? location.getAttribute("pinnum") : null;
        field.valid = result.valid;
        field.reason = result.reason;
      }
      if (field.name.includes("streetnames")) {
        field.valid = true;
        field.reason = null;
      }
      return field;
    });
    setAppFields(updateFields);
  }, [location]);
  return (
    <div className="formDiv">
      {contactFields.length === 0 && <CalciteScrim loading></CalciteScrim>}
      {contactFields.length > 0 && (
        <CalciteStepper
          layout={appWidth <= 600 ? "vertical" : "horizontal"}
          scale="s"
          onCalciteStepperItemChange={(e) => {
            stepped(e.target.selectedItem.heading);
          }}
        >
          <CalciteStepperItem
            selected={selectedStep === "Instructions" ? true : undefined}
            heading="Instructions"
          >
            <Intro id="intro"></Intro>
            <CalciteButton
              scale="l"
              onClick={(e) => {
                setSelectedStep("Contact Info");
                stepped("Contact Info");
                setAgree(true);
              }}
            >
              I Agree
            </CalciteButton>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Contact Info" ? true : undefined}
            disabled={agree ? undefined : true}
            heading="Contact Info"
          >
            <ContactInfo
              nextStep={(step) => {
                setSelectedStep(step);
                stepped(step);
              }}
              contactFields={contactFields}
            ></ContactInfo>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Project Location" ? true : undefined}
            id="location-stepper"
            heading="Project Location"
            disabled={
              contactFields.filter((f) => f.valid === false).length
                ? true
                : undefined
            }
          >
            <ProjectLocation
              nextStep={(step) => {
                setSelectedStep(step);
                stepped(step);
              }}
              locationSet={(location) => setLocation(location)}
              screenshotSet={(screenshot) => setScreenshot(screenshot)}
            ></ProjectLocation>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Project Details" ? true : undefined}
            heading="Project Details"
            disabled={location !== undefined ? undefined : true}
          >
            <ProjectDetails
              nextStep={(step) => {
                setSelectedStep(step);
                stepped(step);
              }}
              appFields={appFields}
              attachments={attachments}
              screenshotRef={screenshotRef}
              streetsSet={(streets) => setStreets(streets)}
              streetsNamesSubmittingChanged={(streets) =>
                setStreetsSubmitting(streets)
              }
            ></ProjectDetails>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Street Names" ? true : undefined}
            heading="Street Names"
            disabled={
              appFields.filter((f) => f.valid === false).length
                ? true
                : undefined
            }
          >
            <Streets
              streets={streets} 
              streetsUpdated={streets => setStreets(streets)}></Streets>
            {streets.length && (
              <CalciteButton
                scale="l"
                disabled={
                  streets.filter((street) => street.name?.valid === false)
                    .length ||
                  streets.filter((street) => street.type?.valid === false)
                    .length
                    ? true
                    : undefined
                }
                onClick={(_) => {
                  setSuccess(
                    submitApplication(
                      contactFields,
                      appFields,
                      streets,
                      location,
                      attachments,
                      screenshot,
                      screenshotRef
                    )
                  );
                }}
              >
                Submit
              </CalciteButton>
            )}
          </CalciteStepperItem>
        </CalciteStepper>
      )}
      <SubmittedModal
        open={success}
        closed={() => setSuccess(false)}
      ></SubmittedModal>
      <StreetTypesModal
        open={showStreetTypes}
        closed={() => setShowStreetTypes(false)}
      ></StreetTypesModal>
      <StreetNameRulesModal
        open={showStreetNameRules}
        closed={() => setShowStreetNameRules(false)}
      ></StreetNameRulesModal>
    </div>
  );
}

export default Form;
