import { useState, useEffect, useRef } from "react";
import {
    formLayer,
    getApplication,
    getFields,
    streetsTable,
    submitApplication,
  } from "../../utils/form";
export const useForm = (config) => {
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

    const handleSubmittedModalClosed = () => setSuccess(false);
    const handleFieldsUpdated = (updatedFields) => {
        const result = Array.from(
          [...fields, ...updatedFields]
            .reduce(
              (acc, item) => acc.set(item.name, item),
              new Map()
            )
            .values()
        );
        setFields(result);
      }
    const handleAgreed = () => setAgree(true)
    const handleScreenshotSet = (screenshot) => setScreenshot(screenshot)
    const handleNextStep = (step) => setSelectedStep(step);
    const handleStepperChanged = (e) => setSelectedStep(e.target.selectedItem.heading)
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
        window.addEventListener("resize", () =>
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
        const updatedFields = fields.map((field) => {
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
    useEffect(() => {
      console.log(success)
    },[success])
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
    return { mode, fields, setFields, attachments, screenshotRef, selectedStep, handleNextStep, layout, agreed, handleAgreed, location, setLocation, handleScreenshotSet, loading, status, approve, id, submit, success, handleSubmittedModalClosed, handleFieldsUpdated, handleStepperChanged }
}