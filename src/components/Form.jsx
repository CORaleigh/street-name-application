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
  CalciteNotice,
  CalciteModal,
} from "@esri/calcite-components-react";
import { useEffect, useRef, useState } from "react";
import Intro from "../Intro";
import "./Form.css";
import {
  getFields,
  loadMap,
  checkStreetNames,
  validateEmail,
  validatePhone,
  getStreetTypes,
  submitApplication,
} from "./utils/form";
function Form() {
  const [appFields, setAppFields] = useState([]);
  const [contactFields, setContactFields] = useState([]);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [streetsSubmitting, setStreetsSubmitting] = useState(1);
  const [streetsNeeded, setStreetsNeeded] = useState(1);
  const [selectedStep, setSelectedStep] = useState("Instructions");
  const contactStep = useRef(null);
  const locationStep = useRef(null);
  const detailsStep = useRef(null);
  const streetsStep = useRef(null);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(undefined);
  const [files, setFiles] = useState([{}]);
  const [agree, setAgree] = useState(false);
  const [appWidth, setAppWidth] = useState(window.innerWidth);
  const attachments = useRef(null);

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
  const stepped = async (step) => {
    debugger

    if (!mapLoaded && step === 'Project Location') {
      await loadMap(mapRef.current, setLocation);
      setMapLoaded(true);
    }
    setSelectedStep(step);
    if (step === 'Instructions') {
      setAgree(false);
    }
    if (step === 'Street Names') {
      customElements.whenDefined('calcite-input-message').then(async _ => {
        document.querySelectorAll('calcite-stepper-item[selected] calcite-input-message').forEach(message => {
          var style = document.createElement( 'style' )
          style.innerHTML = ':host([status="valid"]) .calcite-input-message-icon {color: var(--calcite-ui-warning) !important;}';
          message.shadowRoot.appendChild( style )
        })

      });
    }
  
  };

  const updateStreets = (e) => {
    if (e.target.value < streetsSubmitting) {
      setStreets(streets.slice(0, -1));
    } else {
      const addStreets = [];
      for (let i = streets.length; i < parseInt(e.target.value); i++) {
        addStreets.push({
          name: { value: null, valid: false, reason: "Street name required" },
          type: { value: null, valid: false, reason: "Street type required" },
        });
      }
      setStreets([...streets, ...addStreets]);
    }

    setStreetsSubmitting(parseInt(e.target.value));
  };
  const inputChanged = (e, i, fields, setFields) => {
    if (e.target.name === "streetnamessubmitting") {
      updateStreets(e);
    }
    if (e.target.name === "streetnamesneeded") {
      setStreetsNeeded(parseInt(e.target.value));
      updateStreets(e);
    }
    const updateFields = fields.map((field, index) => {
      let result = { valid: true, reason: null };
      if (field.name.toLowerCase().includes("email")) {
        result = validateEmail(e.target.value);
      }
      if (field.name.toLowerCase().includes("phone")) {
        result = validatePhone(e.target.value);
      }
      if (!field.nullable && e.target.value.length === 0) {
        result = { valid: false, reason: "Required" };
      }
      if (index === i) {
        field.value = e.target.value;
        field.valid = result.valid;
        field.reason = result.reason;
      }
      return field;
    });
    setFields(updateFields);
  };
  const streetNameChanged = async (e, i) => {
  
    const result = await checkStreetNames(e.target.value, streetTypes);
    const newStreets = streets.map((street, index) => {
      if (index === i) {
        street.name = {
          value: e.target.value,
          valid: result.valid,
          reason: result.reason,
        };
      }
      return street;
    });
    setStreets(newStreets);
  };
  const streetTypeChanged = async (e, i) => {
    let result = { valid: true, reason: null };
    if (!e.target.selectedOption.value) {
      result = { valid: false, reason: "Street type required" };
    }
    const newStreets = streets.map((street, index) => {
      if (index === i) {
        street.type = {
          value: e.target.selectedOption.value,
          valid: result.valid,
          reason: result.reason,
        };
      }
      return street;
    });
    setStreets(newStreets);
  };

  const fileChanged = (e, i) => {
    var file = e.target.files[0];
    const newfiles = files.map((f, index) => {
      if (index === i) {
        f.name = file.name;
      }
      return f;
    });
    setFiles(newfiles);
    //setFiles([...files.slice(0, i), {...files[i]}]);
    // setFiles([...[...files.slice(0, i), {...files[i]}], ...[{name: `File ${(i + 1).toString()}`}]]);
    // if (file == undefined) return;
    // var reader = new FileReader();
    // reader.onload = function (event) {
    //   const reader_image = event.target.result;
    //   const image = new Image();
    //   image.onload = (e) => {
    //     setFiles([...photos.slice(0, i), {...photos[i], src: reader_image, height: e.target.height, width: e.target.width}]);

    //     //setPhotos([...[...photos.slice(0, i), {...photos[i], src: reader_image, height: e.target.height, width: e.target.width}], ...[{name: `Photo ${(i + 1).toString()}`, src: '', height: 0, width: 0}]]);

    //   };
    //   image.src = reader_image;
    //   };
    // reader.readAsDataURL(file);
  };

  useEffect(() => {
    window.addEventListener('resize', _ => setAppWidth(window.innerWidth)) ;
    (async () => {
      const fields = await getFields("155f0425df84404eb3a9b67cfcbece15");
      fields.forEach((f) => {
        f.valid = f.nullable ? true : false;
        f.reason = f.nullable ? null : "Required";
        f.value = "";
        if (f.name.includes("email")) {
          f.placeholder = "user@domain.com";
        }
        if (f.name.includes("phone")) {
          f.placeholder = "999-999-9999";
        }
        if (f.name === "contact") {
          f.placeholder = "First Last";
        }
        if (f.name === 'streetnamessubmitting' || f.name === 'streetnamesneeded') {
          f.value = '1';
        }
      });
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
      setStreetTypes([...streetTypes, ...(await getStreetTypes())]);
    })();
  }, []);
  useEffect(() => {
    const updateFields = appFields.map((field, index) => {
      let result = { valid: true, reason: null };
      if (field.name.toLowerCase().includes("address")) {
        field.value = location.getAttribute("SITE_ADDRESS");
        field.valid = result.valid;
        field.reason = result.reason;
      }
      if (field.name.toLowerCase().includes("zip")) {
        field.value = location.getAttribute("Postal");
        field.valid = result.valid;
        field.reason = result.reason;
      }
      if (field.name.toLowerCase() === "pinnum") {
        field.value = location.getAttribute("PIN_NUM");
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
        <CalciteStepper layout={appWidth <= 600 ? 'vertical' : 'horizontal'} scale="s" onCalciteStepperItemChange={(e) => {stepped(e.target.selectedItem.heading)}}>
                    <CalciteStepperItem
            selected={selectedStep === "Instructions" ? true : undefined}
            ref={contactStep}
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
            ref={contactStep}
            disabled={agree ? undefined : true}            
            heading="Contact Info"
          >
            {contactFields.map((f, i) => (
              <CalciteLabel scale="l" key={f.name}>
                {f.alias}
                <CalciteInput
                  scale="l"
                  clearable
                  maxLength={f.length}
                  type={f.name.includes("email") ? "email" : "text"}
                  name={f.name}
                  status={f.valid ? "valid" : "invalid"}
                  placeholder={f.placeholder}
                  onCalciteInputInput={(e) => {
                    inputChanged(e, i, contactFields, setContactFields);
                  }}
                  value={f.value}
                ></CalciteInput>
                {!f.valid && (
                  <CalciteInputMessage
                    scale="l"
                    status={f.valid ? "valid" : "invalid"}
                  >
                    {f.reason}
                  </CalciteInputMessage>
                )}
              </CalciteLabel>
            ))}

            <CalciteButton
              scale="l"
              disabled={
                contactFields.filter((f) => f.valid === false).length
                  ? true
                  : undefined
              }
              onClick={(e) => {
                setSelectedStep("Project Location");
                stepped("Project Location");
              }}
            >
              Next
            </CalciteButton>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Project Location" ? true : undefined}
            ref={locationStep}
            id="location-stepper"
            heading="Project Location"
            disabled={
              contactFields.filter((f) => f.valid === false).length
                ? true
                : undefined
            }
          >
            <div ref={mapRef}></div>
            <CalciteButton
              scale="l"
              disabled={location !== undefined ? undefined : true}
              onClick={(e) => {
                setSelectedStep("Project Details");
              }}
            >
              Next
            </CalciteButton>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Project Details" ? true : undefined}
            ref={detailsStep}
            heading="Project Details"
            disabled={location !== undefined ? undefined : true}
          >
            {appFields.map((f, i) => (
              <CalciteLabel scale="l" key={f.name}>
               
                {f.alias}
                <CalciteInput
                  scale="l"
                  clearable
                  name={f.name}
                  maxLength={f.length}
                  min={
                    f.name.includes("streetnamesneeded")
                      ? 1
                      : f.name.includes("streetnamessubmitting")
                      ? streetsNeeded
                      : undefined
                  }
                  value={
                    f.name.includes("streetnamessubmitting")
                      ? streetsSubmitting <= streetsNeeded
                        ? streetsNeeded
                        : streetsSubmitting
                      : f.name.includes("streetnamesneeded")
                      ? streetsNeeded
                      : f.value
                  }
                  type={f.name.includes("streetnames") ? "number" : "text"}
                  onCalciteInputInput={(e) => {
                    inputChanged(e, i, appFields, setAppFields);
                  }}
                  status={f.valid ? "valid" : "invalid"}
                ></CalciteInput>
               
                {!f.valid && (
                  <CalciteInputMessage
                    scale="l"
                    status={f.valid ? "valid" : "invalid"}
                  >
                    {f.reason}
                  </CalciteInputMessage>
                )}
                         { f.name === 'streetnamessubmitting' &&  streetsSubmitting === streetsNeeded && <CalciteNotice open kind="warning" icon="information">
              <div slot="message">
                Recommend submitting a few more street names than needed, in case there are
                unapproveable street names.
              </div>
            </CalciteNotice>}     
              </CalciteLabel>
            ))}

            <CalciteLabel scale="l">
              Site Plan
            <form ref={attachments}>
              {files &&
                files.map((file, i) => {
                  return (
                    <div className="row" key={`file${i.toString()}`}>
                      <input
                        id={`fileInput${i.toString()}`}
                        accept="application/pdf,"
                        type="file"
                        name="attachment"
                        capture="environment"
                        onChange={(e) => {
                          fileChanged(e, i);
                        }}
                      />
                      <CalciteButton scale="l" className="upload">
                        Upload File
                      </CalciteButton>
                      <CalciteLabel className="file-name" scale="l">
                        {file?.name}{" "}
                      </CalciteLabel>
                      <label
                        htmlFor={`fileInput${i.toString()}`}
                        className="custom-file-upload"
                      ></label>
                    </div>
                  );
                })}
            </form>
            </CalciteLabel>
            <CalciteButton
              scale="l"
              disabled={
                appFields.filter((f) => f.valid === false).length
                  ? true
                  : undefined
              }
              onClick={(e) => {
                setSelectedStep("Street Names");
                stepped("Street Names");
              }}
            >
              Next
            </CalciteButton>
          </CalciteStepperItem>
          <CalciteStepperItem
            selected={selectedStep === "Street Names" ? true : undefined}
            ref={streetsStep}
            heading="Street Names"
            disabled={
              appFields.filter((f) => f.valid === false).length
                ? true
                : undefined
            }
          >
            {streets.map((street, i) => {
              return (
                <CalciteCard key={i + 1}>
                  <span slot="title">Street {i + 1}</span>
                  <CalciteLabel scale="l">
                    Street Name
                    <CalciteInput
                      scale="l"
                      maxLength={20}
                      onCalciteInputChange={(e) => {
                        e.target.setAttribute('clearable', true);
                        streetNameChanged(e, i);
                      }}
                      onCalciteInputInput={e => e.target.setAttribute('clearable', true)}
                      value={street.name.value}
                      status={street.name.valid ? "valid" : "invalid"}
                    ></CalciteInput>
                    
                      <CalciteInputMessage
                        scale="l"                    
                        icon={!street.name.valid ? 'x-octagon-f' : street.name.valid && street.name.reason ? 'exclamation-mark-triangle-f' : undefined }
                        status={street.name.valid ? "valid" : "invalid"}
                      >
                        {street.name.reason}
                      </CalciteInputMessage>
              
                  </CalciteLabel>
                  {street.type && (
                    <CalciteLabel scale="l">
                      Street Type
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
                      attachments
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
      <CalciteModal
        open={success ? true : undefined}
        aria-labelledby="modal-title"
        id="success-modal"
        onCalciteModalClose={(_) => {
          window.location.reload();
          setSuccess(false);
        }}
      >
        <div slot="header" id="modal-title">
          Application Submitted
        </div>
        <div slot="content">
          You're applicaiton has been successfully submitted. Staff at the City
          of Raleigh and Wake County will review your application. Once
          approved, you will receive a copy of the application. Applications are
          typically reviewed on Thursdays.
        </div>
        <div slot="footer">
          <CalciteButton onClick={(_) => setSuccess(false)}></CalciteButton>
        </div>
      </CalciteModal>
    </div>
  );
}

export default Form;
