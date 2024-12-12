import {
    CalciteBlock,
    CalciteButton,
    CalciteLink,
  } from "@esri/calcite-components-react";
import PropTypes from "prop-types";

function ApplicationDetails({ feature, attachments, formLayer, creds, setShowMap }) {
  return (
    <CalciteBlock heading="Application Details" collapsible open>
      <h3>Contact</h3>
      <div>{feature.getAttribute("contact")}</div>
      {feature.getAttribute("organization") && (
        <div>{feature.getAttribute("organization")}</div>
      )}
      {feature.getAttribute("email") && (
        <div>
          <CalciteLink href={`mailto:${feature.getAttribute("email")}/`}>
            {feature.getAttribute("email")}
          </CalciteLink>
        </div>
      )}
      {feature.getAttribute("phone") && (
        <div>{feature.getAttribute("phone")}</div>
      )}
      <h3>Project</h3>
      {feature.getAttribute("projectname") && (
        <div>
          <strong>Project Name: </strong>
          {feature.getAttribute("projectname")}
        </div>
      )}
      {feature.getAttribute("plannumber") && (
        <div>
          <strong>Plan Number: </strong>
          {feature.getAttribute("plannumber")}
        </div>
      )}
      {feature.getAttribute("address") && (
        <div>
          <strong>Address: </strong>
          {feature.getAttribute("address")}
        </div>
      )}
      {feature.getAttribute("zipcode") && (
        <div>
          <strong>ZIP Code: </strong>
          {feature.getAttribute("zipcode")}
        </div>
      )}
      {feature.getAttribute("pinnum") && (
        <div>
          <strong>PIN Number: </strong>
          {feature.getAttribute("pinnum")}
        </div>
      )}
      {attachments.length > 0 && <><h3>Attachments</h3>
      <div className="attachments">
        {attachments?.map((attachment, i) => (
          <CalciteLink
            target="_blank"
            iconStart="download"
            key={`attachment${i}`}
            href={`${formLayer.url}/${formLayer.layerId}/${attachment.parentObjectId}/attachments/${attachment.id}/?token=${creds?.token}`}
          >
            {attachment.name}
          </CalciteLink>
        ))}
      </div></>}
      {attachments.length === 0 && <p></p>}
      <CalciteButton iconEnd="map" onClick={() => setShowMap(true)}>
        View Map
      </CalciteButton>
    </CalciteBlock>
  );
}
ApplicationDetails.propTypes = {
    feature: PropTypes.any,
    attachments: PropTypes.array, 
    formLayer: PropTypes.any, 
    creds: PropTypes.any,
    setShowMap: PropTypes.func
  };
  export default ApplicationDetails;
  