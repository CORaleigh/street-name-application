import {
  CalciteButton,
  CalciteLabel,
  CalciteNotice,
  CalciteIcon
} from "@esri/calcite-components-react";
import { useState } from "react";

function Attachments(props) {
  const [files, setFiles] = useState([{}]);
  const [fileLimit, setFileLimit] = useState(false);
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

  return (
    <>
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
                    iconEnd="upload"
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
    </>
  );
}

export default Attachments;
