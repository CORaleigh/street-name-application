import "./Form.css";
import {
  CalciteStepper,
  CalciteStepperItem,
  CalciteScrim,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteShell,
} from "@esri/calcite-components-react";
import Intro from "./Intro";
import { useEffect, useRef, useState } from "react";
import Contact from "./Contact";
import Details from "./Details";
import Location from "./Location";
import Streets from "./Streets";
import { config } from "../public/config";
import {
  formLayer,
  getApplication,
  getFields,
  streetsTable,
  submitApplication,
} from "./utils/form";
import SubmittedModal from "./SubmittedModal";
import Status from "./Status";
import Approve from "./Approve";

function Form() {
  const [mode, setMode] = useState("submit");
  const [selectedStep, setSelectedStep] = useState("Instructions");
  const [layout, setLayout] = useState();
  const [agreed, setAgree] = useState(false);
  const [location, setLocation] = useState(undefined);
  const [screenshot, setScreenshot] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const attachments = useRef(null);
  const screenshotRef = useRef(null);

  const [status, setStatus] = useState();
  const [approve, setApprove] = useState();

  const [id, setId] = useState();

  const [fields, setFields] = useState([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log(window.location)
    const mode = params.get("mode");
    if (mode === 'status') {
      setMode("status");
      (async () => {
        const app = await getApplication(params.get("id"));
        console.log(app);
        setStatus(app);
        setLoading(false);
      })();
    }
    if (mode === 'approve') {
      setMode("approve");
      formLayer.portalItem.id = config.adminFormLayerId;
      streetsTable.portalItem.id = config.adminFormLayerId;
      (async () => {
        const params = new URLSearchParams(window.location.search);
        const app = await getApplication(params.get("id"));
        console.log(app);
        setApprove(app);
        setLoading(false);
      })();
    } else {
      setLayout(window.innerWidth <= 640 ? "vertical" : "horizontal");
      window.addEventListener("resize", (_) =>
        setLayout(window.innerWidth <= 640 ? "vertical" : "horizontal")
      );
      (async () => {
        const fields = await getFields();
        setLoading(false);
        setFields(fields);
      })();
    }
  }, []);
  useEffect(() => {
    if (location && fields) {
      const updatedFields = fields.map((field, index) => {
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
      const result = Array.from(
        [...fields, ...updatedFields]
          .reduce((acc, item) => acc.set(item.name, item), new Map())
          .values()
      );
      setFields(result);
    }
  }, [location]);
  const submit = async (streets) => {
    setLoading(true);
    const success = await submitApplication(
      location,
      fields,
      streets,
      screenshot,
      attachments,
      screenshotRef
    );
    setSuccess(success.success);
    setId(success?.id);
    setLoading(false);
  };
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
            onCalciteStepperItemChange={(e) => {
              setSelectedStep(e.target.selectedItem.heading);
            }}
          >
            <CalciteStepperItem
              heading="Instructions"
              selected={selectedStep === "Instructions" ? true : undefined}
            >
              <Intro
                nextStep={(step) => setSelectedStep(step)}
                stepChanged={selectedStep !== "Instructions"}
                agreed={() => setAgree(true)}
              ></Intro>
            </CalciteStepperItem>
            <CalciteStepperItem
              heading="Contact Info"
              selected={selectedStep === "Contact Info" ? true : undefined}
              disabled={agreed ? undefined : ""}
            >
              {fields && (
                <Contact
                  nextStep={(step) => setSelectedStep(step)}
                  fields={fields.filter((f) =>
                    config.fields.contact.includes(f.name)
                  )}
                  updated={(updatedFields) => {
                    const result = Array.from(
                      [...fields, ...updatedFields]
                        .reduce(
                          (acc, item) => acc.set(item.name, item),
                          new Map()
                        )
                        .values()
                    );
                    setFields(result);
                  }}
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
                nextStep={(step) => setSelectedStep(step)}
                screenshotSet={(screenshot) => setScreenshot(screenshot)}
                locationSet={(location) => setLocation(location)}
              ></Location>
            </CalciteStepperItem>
            <CalciteStepperItem
              heading="Project Details"
              selected={selectedStep === "Project Details" ? true : undefined}
              disabled={location === undefined ? "" : undefined}
            >
              <Details
                nextStep={(step) => setSelectedStep(step)}
                fields={fields.filter((f) =>
                  config.fields.details.includes(f.name)
                )}
                updated={(updatedFields) => {
                  const result = Array.from(
                    [...fields, ...updatedFields]
                      .reduce(
                        (acc, item) => acc.set(item.name, item),
                        new Map()
                      )
                      .values()
                  );
                  setFields(result);
                }}
                disabled={location === undefined ? "" : undefined}
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
        closed={() => setSuccess(false)}
        id={id}
      ></SubmittedModal>
    </>
  );
}

export default Form;
