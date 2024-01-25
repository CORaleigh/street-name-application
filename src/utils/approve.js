export const updateInReviewStreetType = async (e, street, streets) => {

  const newStreets = streets.map((s) => {
    if (s.getAttribute('GlobalID') === street.getAttribute('GlobalID')) {

      street.setAttribute('streettype', e.target.selectedOption.value);
    }
    return street;
  });

  return newStreets;
}

export const updateInReviewStreetName = async (e, street, streets) => {

  const newStreets = streets.map((s) => {
    if (s.getAttribute('GlobalID') === street.getAttribute('GlobalID')) {

      street.setAttribute('streetname', e.target.value);
    }
    return street;
  });

  return newStreets;
}

export const toggleEditing = async (street, streets) => {
  const newStreets = streets.map((s) => {
    if (s.getAttribute('GlobalID') === street.getAttribute('GlobalID')) {
      street.isEditing = !s.isEditing;
    }
    return s;
  });

  return newStreets;
};

export const getIcon = (status) => {
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
export const getKind = (status) => {
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
export const getNoticeMessage = (feature, approvedStreets) => {
  const needed = feature.getAttribute("streetnamesneeded");
  const status = feature.getAttribute("status");
  if (status.includes("Rejected")) {
    return `${approvedStreets?.length
      } of ${needed} street names have been approved by the ${feature.getAttribute("status").includes("City") ? "City" : "County"
      }, please submit ${needed - approvedStreets?.length} more`;
  }
  if (status.includes("Approved")) {
    return `${approvedStreets?.length
      } of ${needed} street names have been approved by the ${feature.getAttribute("status").includes("City") ? "City" : "County"
      }`;
  }
  if (status.includes("Review")) {
    return `Application currently being reviewed by the ${feature.getAttribute("status").includes("City") ? "City" : "County"
      }`;
  }
};

export const getApprovedStreets = (feature, streets) => {
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
export const getRejectedStreets = (feature, streets) => {
  if (feature && streets) {
    const status = feature.getAttribute("status");
    return streets.filter(
      (street) =>
        street.getAttribute("status") === "City Rejected" ||
        street.getAttribute("status") === "County Rejected"
    );
  }
};
export const getInReviewStreets = (feature, streets) => {
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

export const canEdit = (feature, cityOrCounty) =>
  (feature.getAttribute("status") === "City Review" &&
    cityOrCounty === "city") ||
  (feature.getAttribute("status") === "County Review" &&
    cityOrCounty === "county");
export const approveDisabled = (feature, inReviewStreets, approvedStreets) =>
  (feature.getAttribute("status") === "City Review" ||
    feature.getAttribute("status") === "County Review") &&
    inReviewStreets &&
    ((feature.getAttribute("status") === "City Review" &&
      approvedStreets.length >= feature.getAttribute("streetnamesneeded") &&
      inReviewStreets.length === 0) ||
      (feature.getAttribute("status") === "County Review" &&
        approvedStreets.length === feature.getAttribute("streetnamesneeded")))
    ? undefined
    : "";
export const rejectDisabled = (feature, inReviewStreets, approvedStreets) =>
  (feature.getAttribute("status") === "City Review" ||
    feature.getAttribute("status") === "County Review") &&
    inReviewStreets &&
    inReviewStreets.length === 0 &&
    approvedStreets.length < feature.getAttribute("streetnamesneeded")
    ? undefined
    : "";
export const streetApproveDisabled = (feature, approvedStreets) =>
  feature.getAttribute("status") === "County Review" &&
    approvedStreets.length === feature.getAttribute("streetnamesneeded")
    ? ""
    : undefined;