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
        id: '08050bf067bb4b20adea4b0b4f0a39e3'
    },
    layerId: 0
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
  const names = localStorage.getItem("street_name_application_streets");
  if (names) {
    streetNames = names.split(",");
  } else {
    await streetNameDirectory.load();
    const count = await streetNameDirectory.queryFeatureCount({
      where: "1=1",
      returnDistinctValues: true,
      outFields: ["ST_NAME"],
    });
    for (let i = 0; i < count / 1000; i++) {
      console.log(i * 1000);
      const result = await streetNameDirectory.queryFeatures({
        start: i * 1000,
        num: 1000,
        where: "1=1",
        returnDistinctValues: true,
        outFields: ["ST_NAME"],
        orderByFields: ["ST_NAME"],
      });
      streetNames += result.features.map((feature) =>
        feature.getAttribute("ST_NAME")
      );
    }
    localStorage.setItem("street_name_application_streets", streetNames);
  }
})();

export const getFields = async (id) => {
  await appLayer.load();
  return appLayer.fields;
};

export const loadMap = async (container, setLocation) => {
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
  });
  view.map.add(parcelsLayer);
  const search = new Search({
    view: view,
    includeDefaultSources: false,
    sources: [
        {
            layer: parcelsLayer,
            searchFields: ["SITE_ADDRESS", "PIN_NUM"],
            displayField: "SITE_ADDRESS",
            exactMatch: false,
            outFields: ["*"],
            name: "Property search",
            placeholder: "Search by address or PIN",
            maxResults: 6,
            maxSuggestions: 6,
            suggestionsEnabled: true,
            minSuggestCharacters: 0
          }
    ]
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

 

    try {
        feature.setAttribute('Postal', await getZip(feature));
        setLocation(e.results[0].results[0].feature);
    } catch (reason) {
        console.log('Location not set', reason)
    }
  });
};
export const getZip = async (feature) => {
    const zipLayer = new FeatureLayer({portalItem: {
        id: '41fcd86f6b0c459ebdc576763a9145cf',
    }, layerId: 0});
    await zipLayer.load();
    let zip = null;
    const result = await zipLayer.queryFeatures({geometry: feature.geometry.centroid, outFields:['ZIPNUM'], returnGeometry: false});
    if (result.features) {
         zip = parseInt(result.features[0].getAttribute('ZIPNUM')).toString();
    }
    return zip;
}
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
    if (streetName.includes(type)) {
      containsType = true;
    }
  });
  if (containsType) {
    return { valid: false, reason: "Name cannot contain a street type" };
  }
  let containsDirection = false;
  directions.forEach((direction) => {
    if (streetName.includes(' '+direction)) {
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
  if (streetNames.find(name => {
    return name.replace(' ', '') === streetName.replace(' ','');
  })) {
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

      if (levenshteinEditDistance(name.replace(' ', ''), streetName.replace(' ', '')) === 1) {
        soundsLike = { valid: false, reason: "Sounds too similar to " + name };
        break;
      }
      if (levenshteinEditDistance(name.replace(' ', ''), streetName.replace(' ', '')) === 2) {
        soundsLike = { valid: true, reason: "May sound similar to " + name +".  If you don't think it sounds similar, you can still submit it." }
        break;
      }

  };

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
  attachments
) => {
    debugger
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
      await appLayer.addAttachment({attributes: {OBJECTID: result.addFeatureResults[0].objectId, GlobalId: result.addFeatureResults[0].globalId}}, attachments.current);

      return true;
    }
  } catch (error) {
    debugger
    return false;
  }
};
