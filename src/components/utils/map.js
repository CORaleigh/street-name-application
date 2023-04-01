import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Search from "@arcgis/core/widgets/Search";

import Graphic from "@arcgis/core/Graphic";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
const parcelsLayer = new FeatureLayer({
  portalItem: {
    id: "08050bf067bb4b20adea4b0b4f0a39e3",
  },
  layerId: 0,
});

export const loadMap = async (
  container,
  setLocation,
  setLocationFound,
  locationSet,
  screenshotSet,
  setScreenshot
) => {
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
          type: "picture-marker",
          url: "./assets/pin.svg",
          height: 36,
          width: 36,
        },
      },
    ],
  });
  //await streetNameDirectory.load();
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
        if (hitTest.results.length) {
          feature.setAttribute(
            "pinnum",
            hitTest.results[0].graphic.attributes["PIN_NUM"]
          );

          setLocation(feature);
          locationSet(feature);
          const screenshot = await view.takeScreenshot({ width: 1048, height: 586 });
          screenshotSet(screenshot);
          setScreenshot(screenshot);
          success = {
            valid: true,
            reason: `Location set to ${feature.attributes["address"]}`,
          };
        } else {
          success = {
            valid: false,
            reason: "Address not located on a property",
          };
        }
      } else {
        setLocation(undefined);
        locationSet(undefined);
        screenshotSet(undefined);
      }
    } catch (reason) {
      setLocation(undefined);
      locationSet(undefined);
      screenshotSet(undefined);

      console.log(success);
    } finally {
      setLocationFound(success);
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
