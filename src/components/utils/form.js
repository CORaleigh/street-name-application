import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import { streetTable } from "./streets";

const appLayer = new FeatureLayer({
  portalItem: {
    id: "155f0425df84404eb3a9b67cfcbece15",
  },
  layerId: 0,
});

export const getFields = async (id) => {
  await appLayer.load();
  appLayer.fields.forEach((f) => {
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
    if (f.name === "streetnamessubmitting" || f.name === "streetnamesneeded") {
      f.value = "1";
    }
  });
  return appLayer.fields;
};

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    ? { valid: true, reason: null }
    : { valid: false, reason: "Email format not valid" };
};

export const validatePhone = (name) => {
  return String(name)
    .toLowerCase()
    .match(/^\d{3}\-\d{3}\-\d{4}$/)
    ? { valid: true, reason: null }
    : { valid: false, reason: "Phone number must be in XXX-XXX-XXXX format" };
};

export const submitApplication = async (
  contactFields,
  appFields,
  streets,
  location,
  attachments,
  screenshot,
  screenshotRef
) => {
  const application = new Graphic({
    attributes: {},
    geometry: location.centroid,
  });
  console.log(contactFields, appFields);
  contactFields.forEach(
    (field) => (application.attributes[field.name] = field.value)
  );
  appFields.forEach(
    (field) => (application.attributes[field.name] = field.value)
  );
  console.log(application);
  const result = await appLayer.applyEdits({ addFeatures: [application] });
  console.log(result);
  try {
    if (result.addFeatureResults.length) {
      const guid = result.addFeatureResults[0].globalId;
      const streetnames = streets.map(
        (street) =>
          new Graphic({
            attributes: {
              streetname: street.name.value,
              streettype: street.type.value,
              applicationid: guid,
            },
          })
      );
      const streetResult = await streetTable.applyEdits({
        addFeatures: streetnames,
      });

      if (attachments.current.querySelector("input").files.length) {
        try {
          await appLayer.addAttachment(
            {
              attributes: {
                OBJECTID: result.addFeatureResults[0].objectId,
                GlobalId: result.addFeatureResults[0].globalId,
              },
            },
            attachments.current
          );
        } catch (error) {
          console.log(error);
        }
      }

      if (screenshot) {
        try {
          const res = await fetch(screenshot.dataUrl, { responseType: "blob" });
          let blob = await res.blob();
          const file = new File([blob], "screenshot.png", {
            type: "image/png",
          });
          const dt = new DataTransfer();
          dt.items.add(file);
          screenshotRef.current.querySelector(
            'input[name="screenshot"]'
          ).files = dt.files;
          await appLayer.addAttachment(
            {
              attributes: {
                OBJECTID: result.addFeatureResults[0].objectId,
                GlobalId: result.addFeatureResults[0].globalId,
              },
            },
            screenshotRef.current
          );
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  return true;
};

export const inputChanged = (e, i, fields, setFields) => {
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
