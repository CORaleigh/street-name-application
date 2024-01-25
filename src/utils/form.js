import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { config } from "../../public/config";

export const formLayer = new FeatureLayer({
    portalItem: {
        id: config.formLayerId,
    },
    layerId: 0,
});
export const streetsTable = new FeatureLayer({
    portalItem: {
        id: config.formLayerId,
    },
    layerId: 1,
});


export const getApplication = async (id) => {
    if (id) {

        const results = await formLayer.queryFeatures({
            where: `GlobalId = '${id}'`,
            outFields: ['*'],
            returnGeometry: true
        });
        if (results.features.length === 0) {
            return { valid: false, message: "ID not found", feature: null, streets: [], attachments: [] };
        } else {
            const feature = results.features[0];
            const related = await formLayer.queryRelatedFeatures({
                relationshipId: 0,
                objectId: feature.getObjectId(),
                outFields: ['*'],
                where: '1=1'
            });

            const attachments = await formLayer.queryAttachments({
                objectIds: [feature.getObjectId()]
            });
            return { valid: true, message: "Application retrieved", feature: feature, streets: related[feature.getObjectId()].features, attachments: attachments[feature.getObjectId()] };

        }
    } else {
        return { valid: false, message: "No ID specified", feature: null, streets: [] };
    }
}
export const getFields = async (id) => {
    await formLayer.load();
    let contact = {};
    if (window.localStorage.getItem('streetname_app_contact')) {
        contact = JSON.parse(window.localStorage.getItem('streetname_app_contact'));
    }
    formLayer.fields.forEach((f) => {
        f.value = contact[f.name] ? contact[f.name] : '';
        f.valid = f.nullable ? true : f.value.length > 0 ? true : false;
        f.reason = f.nullable ? null : "Required";
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
    return formLayer.fields;
}
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        ? { valid: true, reason: null }
        : { valid: false, reason: "Email format not valid" };
};

const validatePhone = (name) => {
    return String(name)
        .toLowerCase()
        .match(/^\d{3}\-\d{3}\-\d{4}$/)
        ? { valid: true, reason: null }
        : { valid: false, reason: "Phone number must be in XXX-XXX-XXXX format" };
};

export const inputChanged = (e, i, fields) => {
    const contact = {

    };
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
    updateFields.forEach(field => {
        if (config.fields.contact.includes(field.name)) {
            contact[field.name] = field.value;
        }
    });
    if (contact['contact']) {
        window.localStorage.setItem('streetname_app_contact', JSON.stringify(contact));
    }
    return updateFields
};

export const submitApplication = async (location, fields, streets, screenshot, attachments, screenshotRef) => {
    let success = false;
    let guid = null;
    const valueFields = fields.filter(f => f.value);
    const attributes = { 'status': 'City Review' };
    valueFields.forEach(f => attributes[f.name] = f.value);
    const feature = {
        attributes: attributes,
        geometry: location.geometry
    };
    const result = await formLayer.applyEdits({
        addFeatures: [feature]
    });
    console.log(result);
    if (result?.addFeatureResults.length) {
        guid = result.addFeatureResults[0].globalId;
        const streetnames = streets.map(street => {
            return {
                attributes: {
                    streetname: street.name.value,
                    streettype: street.type.value,
                    applicationid: guid,
                    status: 'City Review'
                }
            }
        });
        const streetResult = await streetsTable.applyEdits({ addFeatures: streetnames });
        if (result?.addFeatureResults.length) {
            success = true;
        }
    }
    if (attachments.current.querySelector("input").files.length) {
        try {
            await formLayer.addAttachment(
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
            await formLayer.addAttachment(
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
    return { success: success, id: guid };
}

export const submitAdditionalStreets = async (streets, feature) => {
    const guid = feature['GlobalID'];
    const streetnames = streets.map(street => {
        return {
            attributes: {
                streetname: street.name.value,
                streettype: street.type.value,
                applicationid: guid,
                status: 'City Review'
            }
        }
    });
    const streetResult = await streetsTable.applyEdits({ addFeatures: streetnames });
    // const formResult = await formLayer.applyEdits({updateFeatures: [{
    //     attributes: {
    //         OBJECTID: feature.getAttribute('OBJECTID'),
    //         status: 'City Review'
    //     }
    // }]});

}


export const changeStreetStatus = async (street, status, streets, feature) => {
    const newStreets = streets.map((s) => {
        if (street.getAttribute('GlobalID') === s.getAttribute('GlobalID')) {
            if (status === 'approve' && feature.getAttribute('status') === 'City Review') {
                s.setAttribute('status', 'City Approved');
                s.setAttribute('cityapproved', 'Yes')
            }
            if (status === 'approve' && feature.getAttribute('status') === 'County Review') {
                s.setAttribute('status', 'County Approved');
                s.setAttribute('countyapproved', 'Yes')
            }
            if (status === 'reject' && feature.getAttribute('status') === 'City Review') {
                s.setAttribute('status', 'City Rejected');
                s.setAttribute('countyapproved', 'No');
            }
            if (status === 'reject' && feature.getAttribute('status') === 'County Review') {
                s.setAttribute('status', 'County Rejected');
                s.setAttribute('countyapproved', 'No');
            }
            if (status === 'review' && feature.getAttribute('status').includes('City')) {
                s.setAttribute('status', 'City Review');
                s.setAttribute('cityapproved', null);
            }
            if (status === 'review' && feature.getAttribute('status').includes('County')) {
                s.setAttribute('status', 'County Review');
                s.setAttribute('countyapproved', null);
            }
        }
        return s;
    });
    return newStreets;
};

export const approveApplication = async (feature, streets) => {
    const updateStreets = streets.map(street => {
        if (street.getAttribute('status') === 'City Approved') {
            street.setAttribute('status', 'County Review');
        } else if (street.getAttribute('status') === 'County Review') {
            street.setAttribute('status', 'Not Needed');
            street.setAttribute('notused', 'Yes');
            street.setAttribute('cityapproved', null);
            street.setAttribute('countyapproved', null);
        }
        return street;
    })
    await streetsTable.applyEdits({ updateFeatures: updateStreets });
    await formLayer.applyEdits({ updateFeatures: [{ attributes: { OBJECTID: feature.getAttribute('OBJECTID'), status: feature.getAttribute('status') === 'City Review' ? 'County Review' : feature.getAttribute('status') === 'County Review' ? 'County Approved' : '' } }] });
    window.location.reload();
};

export const rejectApplication = async (feature, streets) => {
    await streetsTable.applyEdits({ updateFeatures: streets });
    await formLayer.applyEdits({ updateFeatures: [{ attributes: { OBJECTID: feature.getAttribute('OBJECTID'), status: 'City Rejected' } }] });
    window.location.reload();

};  