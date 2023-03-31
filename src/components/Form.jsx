import {
  CalciteLabel,
  CalciteInput,
  CalciteStepper,
  CalciteStepperItem,
  CalciteCard,
  CalciteSelect,
  CalciteOption,
  CalciteInputMessage,
  CalciteButton,
  CalciteScrim,
  CalciteIcon,
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
    updateStreets,
    streets,
    setStreets,
    streetTypes,
    streetNameChanged,
    streetTypeChanged,
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
            {JSON.stringify(streets)}
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
                          setStreets(await streetNameChanged(e, i));
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
                          onCalciteSelectChange={(e) => {
                            streetTypeChanged(e, i);
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
