
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Search from "@arcgis/core/widgets/Search";
import { config } from "../../public/config";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

const parcelsLayer = new FeatureLayer({
    portalItem: {
        id: config.parcelsLayerId,
    },
    layerId: 0,
    outFields: ["PIN_NUM", "SITE_ADDRESS"]
});
export const loadMap = async (container, setLocationFound) => {
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
        popupEnabled: false
    });

    view.map.add(parcelsLayer);
    await view.when();
    return view;
}

export const loadSearch = (view) => {
    return new Search({
        view: view,
        includeDefaultSources: false,
        sources: [
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
                    height: 36,
                    width: 36,
                },
            },
        ],
    });
}

export const searchComplete = async (e, view, setLocationFound, screenshotSet, locationSet) => {
    const feature = e.results[0].results[0]?.feature;
    let success = {
        valid: false,
        reason: `Location not set, search by address in the upper right corner of the map`,
    };
    await reactiveUtils.whenOnce((_) => view.updating === true);
    await reactiveUtils.whenOnce((_) => view.updating === false);
    success = await checkJurisdiction(feature.geometry);

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
            const screenshot = await view.takeScreenshot({ width: 1048, height: 586 });
            screenshotSet(screenshot);
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

const checkJurisdiction = async (geometry) => {
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