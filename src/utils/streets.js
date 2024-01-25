import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { config } from "../../public/config";
let streetNames = [];
const streetNameDirectory = new FeatureLayer({
  portalItem: {
    id: "1e97845fd3434bf493097f9aa7390811",
  },
});
(async () => {
    let names = localStorage.getItem("street_name_application_streets");
    let lastUpdated = localStorage.getItem(
      "street_name_application_streets_last_updated"
    );
  
    if (!names) {
      const streetNameData = await import("./streetnames");
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
      const result = await streetNameDirectory.queryFeatures({
        start: i * 1000,
        num: 1000,
        where: `DATE_APPROVED >= date'${lastUpdated}'`,
        returnDistinctValues: true,
        outFields: ["ST_NAME"],
        orderByFields: ["ST_NAME"],
      });
      streetNames = streetNames.concat(
        result.features.map((feature) => feature.getAttribute("ST_NAME"))
      );
    }
    streetNames = [...new Set(streetNames)];
    streetNames = streetNames.sort();
    localStorage.setItem("street_name_application_streets", streetNames);
    localStorage.setItem(
      "street_name_application_streets_last_updated",
      new Date().toLocaleDateString()
    );
  })();
const streetsTable = new FeatureLayer({
    portalItem: {
        id: config.formLayerId,
    }, layerId: 1
});

export const loadStreetTypes = async () => {
    await streetsTable.load();
    return streetsTable.fields.find(f => f.name === 'streettype').domain?.codedValues;
}


export const streetTypeChanged = async (e, i, streets) => {
    let result = { valid: true, reason: null };
    if (!e.target.selectedOption.value) {
      result = { valid: false, reason: "Street type required" };
    }
    const newStreets = streets.map((street, index) => {
      if (index === i) {
        street.type = {
          value: e.target.selectedOption.value,
          valid: result.valid,
          reason: result.reason,
        };
      }
      return street;
    });
    return newStreets;
  };
  export const streetNameChanged = async (e, i, streets, streetTypes) => {
    const result = await checkStreetNames(e.target.value, streetTypes, streets);
    const newStreets = streets.map((street, index) => {
      if (index === i) {
        street.name = {
          value: e.target.value,
          valid: result.valid,
          reason: result.reason,
        };
      }
      return street;
    });
    return newStreets;
  };  

  const checkStreetNames = async (value, streetTypes, streets) => {
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
      if (streetName.includes(` ${number} `) || streetName.indexOf(`${number} `) === 0) {
        containsNumber = true;
      }
    });
    if (containsNumber) {
      return { valid: false, reason: "Street name cannot contain a number" };
    }
    if (
      streetNames.find((name) => {
        return name.replace(" ", "") === streetName.replace(" ", "");
      })
    ) {
      return { valid: false, reason: "Street name is already in use" };
    }
    if (
      streets.find((s) => {
        
        return s.name?.value?.replace(" ", "") === value.replace(" ", "");
      })
    ) {
      
      return { valid: false, reason: "Cannot repeat street names" };
    }    
    return { valid: true, reason: "" };
  };

  const validateStreetName = (name) => {
    return String(name)
      .toLowerCase()
      .match(/^[A-Za-z\s]*$/)
      ? { valid: true, reason: null }
      : { valid: false, reason: "Street name must only contain letters" };
  };

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
  ]

  export const streetCommentChanged = async (e, street, streets) => {
    const newStreets = streets.map((s) => {
      if (s.getAttribute('GlobalID') === street.getAttribute('GlobalID')) {
        street.setAttribute('Comments', e.target.value);
      }
      return s;
    });

    return newStreets;
  };  


