import { useEffect, useState } from "react";

export const useStatus = (status) => {
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
      const getNoticeMessage = (feature, approvedStreets) => {
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
        setFeature(status?.feature);
        setApprovedStreets(
          getApprovedStreets(status?.feature, status?.streets)
        );
        setRejectedStreets(
          getRejectedStreets(status?.feature, status?.streets)
        );
        setInReviewStreets(
          getInReviewStreets(status?.feature, status?.streets)
        );
      }, [status]);
    return { approvedStreets, inReviewStreets, rejectedStreets, feature, showSubmitStreets, setShowSubmitStreets, getNoticeMessage, getIcon, getKind }
}