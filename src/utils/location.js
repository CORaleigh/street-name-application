
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { config } from "../config";

const parcelsLayer = new FeatureLayer({
    portalItem: {
        id: config.parcelsLayerId,
    },
    layerId: 0,
    outFields: ["PIN_NUM", "SITE_ADDRESS"],
    popupEnabled: false
});

export const searchSources = [
{
    url: config.geocodeUrl,
    singleLineFieldName: "SingleLine",
    outFields: ["*"],
    placeholder: "Search by address",
    zoomScale: 4800,
    popupEnabled: false,
    resultSymbol: {
        type: "picture-marker",
        url: "./assets/pin.svg",
        height: 24,
        width: 24,
        yoffset: 12
    },
},
]

export const handleViewReady = (e) => {
    e.target.view.map.add(parcelsLayer);
}



export const addPin = (feature, view) => {
    feature.symbol = {
        type: "picture-marker",
        url: "./assets/pin.svg",
        height: 24,
        width: 24,
        yoffset: 12
    };
    view.graphics.add(feature);
}



export const searchComplete = async (e, view, setLocationFound, screenshotSet, locationSet) => {
    const feature = e.results[0].results[0]?.feature;
    let success = {
        valid: false,
        reason: `Location not set, search by address in the upper right corner of the map`,
    };
    await reactiveUtils.whenOnce(() => view.updating === true);
    await reactiveUtils.whenOnce(() => view.updating === false);
    success = await checkJurisdiction(feature?.geometry);

    if (success.valid) {
        feature.setAttribute("Postal", feature.getAttribute("Postal"));
        feature.setAttribute("address", feature.getAttribute("ShortLabel"));
        const hitTest = await view.hitTest(view.toScreen(feature.geometry), {
            include: [parcelsLayer],
        });
        if (hitTest.results.length) {
            feature.setAttribute(
                "pinnum",
                hitTest.results[0].graphic.getAttribute("PIN_NUM")
            );

            locationSet(feature);
            setTimeout(async () => {
                const screenshot = await view.takeScreenshot({ width: 1048, height: 586 });
                screenshotSet(screenshot);
            }, 1000
            )
            success = {
                valid: true,
                reason: `Location set to ${feature.getAttribute("address")}`,
            };
        } else {
            success = {
                valid: false,
                reason: "Address not located on a property",
            };
            locationSet(undefined);
        }

    }
    setLocationFound(success);

}

export const checkParcel = async (feature, view) => {
    await reactiveUtils.whenOnce(() => view.updating === true);
    await reactiveUtils.whenOnce(() => view.updating === false);    
    return await view.hitTest(view.toScreen(feature.geometry), {
        include: [parcelsLayer],
    });
}

export const checkJurisdiction = async (geometry) => {
    if (!geometry) {
        return {}
    }
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
                "Property not located in Wake County, please submit through Wake County at the website below",
            link: config.wakeCountySite
        };
    }
    if (result.features[0].getAttribute("JURISDICTION") !== "RALEIGH") {
        return {
            valid: false,
            reason: `Property is located in ${result.features[0].getAttribute(
                "JURISDICTION"
            ).toLowerCase().replace(/\b\w/g, char => char.toUpperCase())} please check Wake County's website`,
            link: config.wakeCountySite
        };
    }
    return {
        valid: true,
        reason: `Property located in City of Raleigh's jurisdiction`,
    };
};