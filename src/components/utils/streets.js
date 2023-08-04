import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

let streetNames = [];

const streetNameDirectory = new FeatureLayer({
  portalItem: {
    id: "1e97845fd3434bf493097f9aa7390811",
  },
});

export const streetTable = new FeatureLayer({
  portalItem: {
    id: "155f0425df84404eb3a9b67cfcbece15",
  },
  layerId: 1,
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
    console.log(i * 1000);
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
    if (streetName.includes(` ${number} `) || streetName.indexOf(`${number} `) === 0) {
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
  return { valid: true, reason: "" };
  // let soundsLike = { valid: true, reason: "" };
  // console.clear();

  // for (let i = 0; i < streetNames.length; i++) {
  //   const name = streetNames[i];
  //   if (compareTwoStrings(name, streetName) >= 0.7) {
  //     if (compareTwoStrings(name, streetName) >= 0.75) {
  //       //soundsLike = name;
  //     }
  //     console.log(name, compareTwoStrings(name, streetName));
  //   }

  // if (levenshteinEditDistance(name.replace(' ', ''), streetName.replace(' ', '')) === 1) {
  //   soundsLike = { valid: false, reason: "Sounds too similar to " + name };
  //   break;
  // }
  // if (levenshteinEditDistance(name.replace(' ', ''), streetName.replace(' ', '')) === 2) {
  //   if (compareTwoStrings(name.replace(' ', ''), streetName.replace(' ', '')) > 0.75) {
  //     soundsLike = { valid: true, reason: "May sound similar to " + name +".  If you don't think it sounds similar, you can still submit it." }
  //   }
  // }
  // if (
  //   compareTwoStrings(name.replace(" ", ""), streetName.replace(" ", "")) >=
  //   0.8
  // ) {
  //   soundsLike = { valid: false, reason: "Sounds too similar to " + name };
  //   break;
  // }
  // if (
  //   compareTwoStrings(name.replace(" ", ""), streetName.replace(" ", "")) >=
  //   0.7
  // ) {
  //   soundsLike = {
  //     valid: true,
  //     reason:
  //       "May sound similar to " +
  //       name +
  //       ".  If you don't think it sounds similar, you can still submit it.",
  //   };
  // }
  //}

  //return soundsLike;
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
];
const validateStreetName = (name) => {
  return String(name)
    .toLowerCase()
    .match(/^[A-Za-z\s]*$/)
    ? { valid: true, reason: null }
    : { valid: false, reason: "Street name must only contain letters" };
};
