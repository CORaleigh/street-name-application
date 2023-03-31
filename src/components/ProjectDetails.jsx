import {
  CalciteButton,
  CalciteInput,
  CalciteInputMessage,
  CalciteLabel,
  CalciteNotice,
  CalciteIcon,
} from "@esri/calcite-components-react";
import { useEffect, useState, useRef } from "react";
import { inputChanged } from "./utils/form";
import useStreets from "./utils/useStreets";

function ProjectDetails(props) {
  const [appFields, setAppFields] = useState([]);

  const [streetsSubmitting, setStreetsSubmitting] = useState(1);
  const [streetsNeeded, setStreetsNeeded] = useState(1);
  const [files, setFiles] = useState([{}]);
  const [fileLimit, setFileLimit] = useState(false);

  const { updateStreets } = useStreets(props);
  const fileChanged = (e, i) => {
    var file = e.target.files[0];
    console.log(file.size);
    if (file.size * 0.000001 <= 10) {
      const newfiles = files.map((f, index) => {
        if (index === i) {
          f.name = file.name;
        }
        return f;
      });
      setFiles(newfiles);
      setFileLimit(false);
    } else {
      removeFile();
      setFileLimit(true);
    }
  };
  const removeFile = () => {
    setFiles([...[], ...[{}]]);
    const dt = new DataTransfer();
    props.attachments.current.querySelector("input").files = dt.files;
  };
  useEffect(() => {
    if (props.appFields) {
      setAppFields(props.appFields);
    }
  }, []);
  return (
    <div>
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
              if (!f.name.includes("streetnames")) {
                inputChanged(e, i, appFields, setAppFields);
              }
            }}
            onBlur={(e) => {
              inputChanged(e, i, appFields, setAppFields);
              if (e.target.name === "streetnamessubmitting") {
                setStreetsSubmitting(parseInt(e.target.value));
                props.streetsSet(updateStreets(e));

                props.streetsNamesSubmittingChanged(parseInt(e.target.value));
              }
              if (e.target.name === "streetnamesneeded") {
                setStreetsNeeded(parseInt(e.target.value));
                //updateStreets(e);
              }
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
          {f.name === "streetnamessubmitting" &&
            streetsSubmitting === streetsNeeded && (
              <CalciteNotice open kind="warning" icon="information">
                <div slot="message">
                  Recommend submitting a few more street names than needed, in
                  case there are unapproveable street names.
                </div>
              </CalciteNotice>
            )}
        </CalciteLabel>
      ))}
      <br />
      <CalciteLabel scale="l">
        Site Plan
        <form ref={props.attachments}>
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
                  <CalciteButton
                    disabled={file?.name ? true : undefined}
                    scale="l"
                    className="upload"
                  >
                    Upload File
                  </CalciteButton>
                  {file?.name && (
                    <span className="file-name" scale="l">
                      {file?.name}{" "}
                    </span>
                  )}
                  {file?.name && (
                    <CalciteIcon
                      className="file-delete"
                      icon="trash"
                      onClick={removeFile}
                    ></CalciteIcon>
                  )}

                  <label
                    htmlFor={`fileInput${i.toString()}`}
                    className="custom-file-upload"
                  ></label>
                </div>
              );
            })}
          <CalciteNotice
            open
            kind={fileLimit ? "danger" : "info"}
            icon={fileLimit ? "x-octagon-f" : "information"}
          >
            <div slot="message">
              {fileLimit
                ? "File is too large, must be under 10MB"
                : "Must be a single PDF file under 10MB"}
            </div>
          </CalciteNotice>
        </form>
        <form ref={props.screenshotRef}>
          <input
            id="screenshot"
            type="file"
            name="screenshot"
            accept="image/png"
          />
        </form>
      </CalciteLabel>
      <CalciteButton
        scale="l"
        disabled={
          appFields.filter((f) => f.valid === false).length ? true : undefined
        }
        onClick={(e) => {
          props.nextStep("Street Names");
        }}
      >
        Next
      </CalciteButton>
    </div>
  );
}

export default ProjectDetails;
