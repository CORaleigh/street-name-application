import "./Form.css";
import {
  CalciteStepper,
  CalciteStepperItem,
  CalciteScrim,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteShell,
} from "@esri/calcite-components-react";
import Intro from "../Intro/Intro";
import Contact from "../Contact/Contact";
import Details from "../Details/Details";
import Location from "../Location/Location";
import Streets from "../Streets/Streets";

import SubmittedModal from "../SubmittedModal/SubmittedModal";
import Status from "../Status/Status";
import Approve from "../Approve/Approve";
import { config } from "../../../public/config";
import { useForm } from "./useForm";

function Form() {
  const {mode, fields,  attachments, screenshotRef, selectedStep, handleNextStep, layout, agreed, handleAgreed, location, setLocation, handleScreenshotSet, loading, status, approve, id, submit, success, handleSubmittedModalClosed, handleFieldsUpdated, handleStepperChanged} = useForm(config);
  return (
    <>
      {loading && <CalciteScrim loading></CalciteScrim>}
      <CalciteShell>
        <CalciteNavigation slot="header">
          <CalciteNavigationLogo
            slot="logo"
            heading="Street Name Application"
            thumbnail="logo.svg"
          ></CalciteNavigationLogo>
        </CalciteNavigation>
        {mode === "submit" && (
          
          <CalciteStepper
            scale="s"
            layout={layout}
            onCalciteStepperChange={handleStepperChanged}
          >
            <CalciteStepperItem
              heading="Instructions"
              selected={selectedStep === "Instructions" ? true : undefined}
            >
              <Intro
                nextStep={handleNextStep}
                stepChanged={selectedStep !== "Instructions"}
                agreed={handleAgreed}
              ></Intro>
            </CalciteStepperItem>
            <CalciteStepperItem
              heading="Contact Info"
              selected={selectedStep === "Contact Info" ? true : undefined}
              disabled={agreed ? undefined : ""}
            >
              {fields && (
                <Contact
                  nextStep={handleNextStep}
                  fields={fields.filter((f) =>
                    config.fields.contact.includes(f.name)
                  )}
                  updated={handleFieldsUpdated}
                ></Contact>
              )}
            </CalciteStepperItem>
            <CalciteStepperItem
              heading="Project Location"
              selected={selectedStep === "Project Location" ? true : undefined}
              disabled={
                !agreed ||
                fields
                  .filter((f) => config.fields.contact.includes(f.name))
                  .filter((f) => f.valid === false).length
                  ? true
                  : undefined
              }
            >
              <Location
                nextStep={handleNextStep}
                screenshotSet={handleScreenshotSet}
                locationSet={(location) => setLocation(location)}
              ></Location>
            </CalciteStepperItem>
            <CalciteStepperItem
              heading="Project Details"
              selected={selectedStep === "Project Details" ? true : undefined}
              disabled={location === undefined ? true : undefined}
            >
              <Details
                nextStep={handleNextStep}
                fields={fields.filter((f) =>
                  config.fields.details.includes(f.name)
                )}
                updated={handleFieldsUpdated}
                attachments={attachments}
                screenshotRef={screenshotRef}
              ></Details>
            </CalciteStepperItem>
            <CalciteStepperItem
              heading="Street Names"
              selected={selectedStep === "Street Names" ? true : undefined}
              disabled={
                fields
                  .filter((f) => config.fields.details.includes(f.name))
                  .filter((f) => f.valid === false).length
                  ? true
                  : undefined
              }
            >
              <Streets
                submit={(streets) => submit(streets)}
                needed={
                  fields.find((f) => f.name === "streetnamesneeded") &&
                  fields.find((f) => f.name === "streetnamesneeded").value
                }
              ></Streets>
            </CalciteStepperItem>
          </CalciteStepper>
        )}
        {mode === "status" && <Status status={status}></Status>}
      </CalciteShell>
      {mode === "approve" && <Approve approve={approve}></Approve>}
      <SubmittedModal
        open={success}
        closed={handleSubmittedModalClosed}
        id={id}
      ></SubmittedModal>
    </>
  );
}

export default Form;
