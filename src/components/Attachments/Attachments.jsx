import {
  CalciteButton,
  CalciteLabel,
  CalciteNotice,
  CalciteIcon,
} from "@esri/calcite-components-react";
import PropTypes from "prop-types";
import { useAttachments } from "./useAttachments";


function Attachments({attachments, screenshotRef}) {
  const { files, fileChanged, removeFile, fileLimit } = useAttachments(attachments);


  return (
    <>
      <CalciteLabel scale="l">
        Site Plan
        <form ref={attachments}>
          {files &&
            files.map((file, i) => {
              return (
                <div className="row" key={`file${i.toString()}`}>
                  <input
                    id={`fileInput${i.toString()}`}
                    accept="application/pdf"
                    type="file"
                    name="attachment"
                    capture="environment"
                    className="custom-file-upload"
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
        <form ref={screenshotRef}>
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
Attachments.propTypes = {
  attachments: PropTypes.any, // Replace `any` with the actual type if known
  screenshotRef: PropTypes.any,
};

export default Attachments;
