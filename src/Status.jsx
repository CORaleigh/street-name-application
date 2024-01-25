import {
  CalciteButton,
  CalciteCard,
  CalciteList,
  CalciteListItem,
  CalciteListItemGroup,
  CalciteModal,
  CalciteNotice,
} from "@esri/calcite-components-react";
import { useEffect, useState } from "react";
import "./Status.css";
import Streets from "./Streets";
import { submitAdditionalStreets } from "./utils/form";

function Status(props) {
  const getIcon = (status) => {
    if (status) {
      if (status.includes("Rejected")) {
        return "exclamation-mark-circle";
      }
      if (status.includes("Approved")) {
        return "check-circle";
      }
      if (status.includes("Review")) {
        return "file-magnifying-glass";
      }
    }
  };
  const getKind = (status) => {
    if (status) {
      if (status.includes("Rejected")) {
        return "danger";
      }
      if (status.includes("Approved")) {
        return "success";
      }
      if (status.includes("Review")) {
        return "warning";
      }
    }
  };
  const getNoticeMessage = () => {
    const needed = feature.getAttribute("streetnamesneeded");
    const status = feature.getAttribute("status");
    if (status.includes("Rejected")) {
      return `${
        approvedStreets.length
      } of ${needed} street names have been approved by the ${
        feature.getAttribute("status").includes("City") ? "City" : "County"
      }, please submit ${needed - approvedStreets.length} more`;
    }
    if (status.includes("Approved")) {
      return `${
        approvedStreets.length
      } of ${needed} street names have been approved by the ${
        feature.getAttribute("status").includes("City") ? "City" : "County"
      }`;
    }
    if (status.includes("Review")) {
      return `Application currently being reviewed by the ${
        feature.getAttribute("status").includes("City") ? "City" : "County"
      }`;
    }
  };

  const getApprovedStreets = (feature, streets) => {
    if (feature && streets) {
      const status = feature.getAttribute("status");
      return streets.filter(
        (street) =>
          (status.includes("City") &&
            street.getAttribute("status") === "City Approved") ||
          (status.includes("County") &&
            street.getAttribute("status") === "County Approved")
      );
    }
  };
  const getRejectedStreets = (feature, streets) => {
    if (feature && streets) {
      const status = feature.getAttribute("status");
      return streets.filter(
        (street) =>
          (status.includes("City") &&
            street.getAttribute("status") === "City Rejected") ||
          (status.includes("County") &&
            street.getAttribute("status") === "County Rejected")
      );
    }
  };
  const getInReviewStreets = (feature, streets) => {
    if (feature && streets) {
      const status = feature.getAttribute("status");
      return streets.filter(
        (street) =>
          (status.includes("City") &&
            street.getAttribute("status") === "City Review") ||
          (status.includes("County") &&
            street.getAttribute("status") === "County Review")
      );
    }
  };
  const [approvedStreets, setApprovedStreets] = useState([]);
  const [inReviewStreets, setInReviewStreets] = useState([]);
  const [rejectedStreets, setRejectedStreets] = useState([]);
  const [feature, setFeature] = useState();
  const [showSubmitStreets, setShowSubmitStreets] = useState(false);
  useEffect(() => {
    setFeature(props.status?.feature);
    setApprovedStreets(
      getApprovedStreets(props.status?.feature, props.status?.streets)
    );
    setRejectedStreets(
      getRejectedStreets(props.status?.feature, props.status?.streets)
    );
    setInReviewStreets(
      getInReviewStreets(props.status?.feature, props.status?.streets)
    );
  }, [props.status]);

  return (
    <>
      {feature && (
        <CalciteCard>
          <span slot="title">Application Details</span>
          <CalciteNotice
            open
            icon={getIcon(feature.getAttribute("status"))}
            kind={getKind(feature.getAttribute("status"))}
          >
            <div slot="title">{feature.getAttribute("status")}</div>
            <div slot="message">{getNoticeMessage()}</div>
          </CalciteNotice>
          <div slot="content">Street names will be reviewed by</div>
        </CalciteCard>
      )}
      {feature && feature.getAttribute("status").includes("Rejected") && (
        <CalciteButton
          width="full"
          onClick={() => setShowSubmitStreets((prev) => !prev)}
        >
          Submit Additional Street Names
        </CalciteButton>
      )}
      <div></div>
      {inReviewStreets?.length > 0 && (
        <CalciteList>
          <CalciteListItemGroup heading="Street Names In Review">
            {inReviewStreets.map((street) => (
              <CalciteListItem
                key={street.getAttribute("OBJECTID")}
                label={`${street.getAttribute(
                  "streetname"
                )} ${street.getAttribute("streettype")}`}
              ></CalciteListItem>
            ))}
          </CalciteListItemGroup>
        </CalciteList>
      )}
      {approvedStreets?.length > 0 && (
        <CalciteList>
          <CalciteListItemGroup heading="Approved Street Names">
            {approvedStreets.map((street) => (
              <CalciteListItem
                key={street.getAttribute("OBJECTID")}
                label={`${street.getAttribute(
                  "streetname"
                )} ${street.getAttribute("streettype")}`}
              ></CalciteListItem>
            ))}
          </CalciteListItemGroup>
        </CalciteList>
      )}
      {rejectedStreets?.length > 0 && (
        <CalciteList>
          <CalciteListItemGroup heading="Rejected Street Names">
            {rejectedStreets.map((street) => (
              <CalciteListItem
                key={street.getAttribute("OBJECTID")}
                label={`${street.getAttribute(
                  "streetname"
                )} ${street.getAttribute("streettype")}`}
                description={street.getAttribute("Comments")}
              ></CalciteListItem>
            ))}
          </CalciteListItemGroup>
        </CalciteList>
      )}
      <CalciteModal open={showSubmitStreets} fullscreen>
        <div slot="header" id="modal-title">
          Submit Additional Streets
        </div>
        <div slot="content">
          {approvedStreets && feature && (
            <Streets
              submit={async (submittedStreets) => {
                await submitAdditionalStreets(submittedStreets, feature);
                setShowSubmitStreets((prev) => !prev);
                window.location.reload();
              }}
              needed={
                feature.getAttribute("streetnamesneeded") -
                approvedStreets.length
              }
            ></Streets>
          )}
        </div>
      </CalciteModal>
    </>
  );
}

export default Status;
