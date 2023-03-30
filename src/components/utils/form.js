import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";

import MapView from "@arcgis/core/views/MapView";
import Search from "@arcgis/core/widgets/Search";
import { soundex } from "soundex-code";
import { doubleMetaphone } from "double-metaphone";
import { levenshteinEditDistance } from "levenshtein-edit-distance";
import { compareTwoStrings } from "string-similarity";
import { stemmer } from "stemmer";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

let streetNames = [];
const streetNameDirectory = new FeatureLayer({
  portalItem: {
    id: "1e97845fd3434bf493097f9aa7390811",
  },
});

const streetTable = new FeatureLayer({
  portalItem: {
    id: "155f0425df84404eb3a9b67cfcbece15",
  },
  layerId: 1,
});

const appLayer = new FeatureLayer({
  portalItem: {
    id: "155f0425df84404eb3a9b67cfcbece15",
  },
  layerId: 0,
});

const parcelsLayer = new FeatureLayer({
  portalItem: {
    id: "08050bf067bb4b20adea4b0b4f0a39e3",
  },
  layerId: 0,
});

const numbers = [
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
];
const directions = [
  "NORTH",
  "SOUTH",
  "WEST",
  "EAST",
  "NORTHEAST",
  "SOUTHEAST",
  "NORTHWEST",
  "SOUTHWEST",
];

(async () => {
  let names = localStorage.getItem("street_name_application_streets");
  let lastUpdated = localStorage.getItem(
    "street_name_application_streets_last_updated");

  if (!names) {
    const streetNameData = await import('./streetnames');
    names = streetNameData.streetNameList.replace(/(\r\n|\n|\r)/gm, "");
    localStorage.setItem("street_name_application_streets", names);
    lastUpdated = streetNameData.streetNameListLastUpdated;
    localStorage.setItem(
      "street_name_application_streets_last_updated",
      lastUpdated
    );
  }
  streetNames = names.split(",");

  await streetNameDirectory.load();
  const count = await streetNameDirectory.queryFeatureCount({
    where: `DATE_APPROVED >= date'${lastUpdated}'`,
    returnDistinctValues: true,
    outFields: ["ST_NAME"],
  });
  for (let i = 0; i < count / 1000; i++) {
    console.log(i * 1000);
    const result = await streetNameDirectory.queryFeatures({
      start: i * 1000,
      num: 1000,
      where: `DATE_APPROVED >= date'${lastUpdated}'`,
      returnDistinctValues: true,
      outFields: ["ST_NAME"],
      orderByFields: ["ST_NAME"],
    });
    streetNames = streetNames.concat(result.features.map((feature) =>
      feature.getAttribute("ST_NAME")
    ));
  }
  streetNames = [...new Set(streetNames)];
  streetNames = streetNames.sort();
  localStorage.setItem("street_name_application_streets", streetNames);
  localStorage.setItem("street_name_application_streets_last_updated", new Date().toLocaleDateString());
})();

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

export const loadMap = async (container, setLocation, setLocationSuccess, setScreenshot) => {
  const map = new Map({
    basemap: {
      portalItem: {
        id: "109c9fa256a44e28a29a528ca18637e0",
      },
    },
  });
  const view = new MapView({
    map: map,
    container: container,
    zoom: 10,
    center: [-78.6382, 35.7796],
  });
  parcelsLayer.outFields = ["PIN_NUM", "SITE_ADDRESS"];
  view.map.add(parcelsLayer);
  const search = new Search({
    view: view,
    includeDefaultSources: false,
    sources: [
      {
        url: "https://maps.raleighnc.gov/arcgis/rest/services/Locators/Locator/GeocodeServer",
        singleLineFieldName: "SingleLine",
        outFields: ["*"],
        placeholder: "Search by address",
        zoomScale: 4800,
        resultSymbol: {
          type: 'picture-marker',
          url: './assets/pin.svg',
          height: 36,
          width: 36,
        }
      },
    ],
    
  });
  await streetNameDirectory.load();
  view.ui.add(search, "top-right");
  await view.when();
  view.on("click", (e) => {
    search.search(e.mapPoint);
  });
  search.on("search-complete", async (e) => {
    let feature = null;

    feature = e.results[0].results[0]?.feature;

    let success = {
      valid: false,
      reason: `Location not set, search by address in the upper right corner of the map`,
    };

    try {
      await reactiveUtils.whenOnce((_) => view.updating === true);
      await reactiveUtils.whenOnce((_) => view.updating === false);
      success = await checkJurisdiction(feature.geometry);
      if (success.valid) {
        feature.setAttribute("Postal", feature.attributes["Postal"]);
        feature.setAttribute("address", feature.attributes["ShortLabel"]);
        const hitTest = await view.hitTest(view.toScreen(feature.geometry), {
          include: [parcelsLayer],
        });
        debugger;
        if (hitTest.results.length) {
          feature.setAttribute(
            "pinnum",
            hitTest.results[0].graphic.attributes["PIN_NUM"]
          );
          success = {
            valid: true,
            reason: `Location set to ${feature.attributes["address"]}`,
          };

          setLocation(feature);
          setScreenshot(await view.takeScreenshot({width: 1048, height: 586}));
        } else {
          success = {
            valid: false,
            reason: "Address not located on a property",
          };
        }
      } else {
        setLocation(undefined);
        setScreenshot(undefined);
      }
    } catch (reason) {
      setLocation(undefined);
      setScreenshot(undefined);

      console.log(success);
    } finally {
      setLocationSuccess(success);
    }
  });
};
export const checkJurisdiction = async (geometry) => {
  const layer = new FeatureLayer({
    url: "https://maps.wakegov.com/arcgis/rest/services/Jurisdictions/Jurisdictions/MapServer/1",
  });
  await layer.load();
  const result = await layer.queryFeatures({
    geometry: geometry,
    outFields: ["JURISDICTION"],
    returnGeometry: false,
  });
  if (!result.features.length) {
    return {
      valid: false,
      reason:
        "Property not located inside the City of Raleigh, please submit through Wake County",
    };
  }
  if (result.features[0].getAttribute("JURISDICTION") !== "RALEIGH") {
    return {
      valid: false,
      reason: `Property is located in ${result.features[0].getAttribute(
        "JURISDICTION"
      )} please check their website`,
    };
  }
  return {
    valid: true,
    reason: `Property located in City of Raleigh's jurisdiction`,
  };
};
export const getZip = async (feature) => {
  const zipLayer = new FeatureLayer({
    portalItem: {
      id: "41fcd86f6b0c459ebdc576763a9145cf",
    },
    layerId: 0,
  });
  await zipLayer.load();
  let zip = null;
  const result = await zipLayer.queryFeatures({
    geometry: feature.geometry.centroid,
    outFields: ["ZIPNUM"],
    returnGeometry: false,
  });
  if (result.features) {
    zip = parseInt(result.features[0].getAttribute("ZIPNUM")).toString();
  }
  return zip;
};
export const getStreetTypes = async () => {
  await streetTable.load();
  const streetTypeField = streetTable.fields.find(
    (field) => field.name === "streettype"
  );
  return streetTypeField.domain.codedValues;
};
export const checkStreetNames = async (value, streetTypes) => {
  const streetName = value.toUpperCase();
  const types = streetTypes.map((type) => type.name.toUpperCase());
  if (streetName.length < 3) {
    return {
      valid: false,
      reason: "Street name must be longer at least 3 letters",
    };
  }
  const words = streetName.split(" ").length;
  if (words > 2) {
    return {
      valid: false,
      reason: "Street names cannot be longer than 2 words",
    };
  }
  const validStreet = validateStreetName(streetName);
  if (validStreet.valid === false) {
    return validStreet;
  }
  let containsType = false;
  types.forEach((type) => {
    if (streetName.includes(" " + type) || streetName.includes(type + " ")) {
      containsType = true;
    }
  });
  if (containsType) {
    return { valid: false, reason: "Name cannot contain a street type" };
  }
  let containsDirection = false;
  directions.forEach((direction) => {
    if (
      streetName.includes(" " + direction) ||
      streetName.includes(direction + " ")
    ) {
      containsDirection = true;
    }
  });
  if (containsDirection) {
    return {
      valid: false,
      reason: "Street name cannot contain a cardinal direction",
    };
  }
  let containsNumber = false;
  numbers.forEach((number) => {
    if (streetName.includes(number)) {
      containsNumber = true;
    }
  });
  if (containsNumber) {
    return { valid: false, reason: "Street name cannot contain a number" };
  }
  // const where = `ST_NAME = '${streetName}' or ST_NAME = '${streetName.replace(
  //   " ",
  //   ""
  // )}%'`;
  // const result = await streetNameDirectory.queryFeatures({
  //   where: where,
  //   outFields: ["*"],
  // });
  // if (result.features.length) {
  //   return { valid: false, reason: "Street name is already in use" };
  // }
  if (
    streetNames.find((name) => {
      return name.replace(" ", "") === streetName.replace(" ", "");
    })
  ) {
    return { valid: false, reason: "Street name is already in use" };
  }
  let soundsLike = { valid: true, reason: "" };
  console.clear();

  for (let i = 0; i < streetNames.length; i++) {
    const name = streetNames[i];
    if (compareTwoStrings(name, streetName) >= 0.7) {
      if (compareTwoStrings(name, streetName) >= 0.75) {
        //soundsLike = name;
      }
      console.log(name, compareTwoStrings(name, streetName));
    }

    // if (levenshteinEditDistance(name.replace(' ', ''), streetName.replace(' ', '')) === 1) {
    //   soundsLike = { valid: false, reason: "Sounds too similar to " + name };
    //   break;
    // }
    // if (levenshteinEditDistance(name.replace(' ', ''), streetName.replace(' ', '')) === 2) {
    //   if (compareTwoStrings(name.replace(' ', ''), streetName.replace(' ', '')) > 0.75) {
    //     soundsLike = { valid: true, reason: "May sound similar to " + name +".  If you don't think it sounds similar, you can still submit it." }
    //   }
    // }
    if (
      compareTwoStrings(name.replace(" ", ""), streetName.replace(" ", "")) >=
      0.8
    ) {
      soundsLike = { valid: false, reason: "Sounds too similar to " + name };
      break;
    }
    if (
      compareTwoStrings(name.replace(" ", ""), streetName.replace(" ", "")) >=
      0.7
    ) {
      soundsLike = {
        valid: true,
        reason:
          "May sound similar to " +
          name +
          ".  If you don't think it sounds similar, you can still submit it.",
      };
    }
  }

  return soundsLike;
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

export const validateStreetName = (name) => {
  return String(name)
    .toLowerCase()
    .match(/^[A-Za-z\s]*$/)
    ? { valid: true, reason: null }
    : { valid: false, reason: "Street name must only contain letters" };
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


      if (attachments.current.querySelector('input').files.length) {
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
          const res = await fetch(screenshot.dataUrl,{responseType:'blob'});
          let blob = await res.blob()
          const file = new File([blob], 'screenshot.png', {type: 'image/png'});
          const dt = new DataTransfer();
          dt.items.add(file);
          screenshotRef.current.querySelector('input[name="screenshot"]').files = dt.files;
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
