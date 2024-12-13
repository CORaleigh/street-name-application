export const config = {
    formLayerId: "155f0425df84404eb3a9b67cfcbece15",
    webMapId: "109c9fa256a44e28a29a528ca18637e0",
    adminFormLayerId: "f922bf8d5c8d442ba4355c9499e69f02",
    streetTypes: [
        {
            types: 'Parkway', description: `Major highways or arterials through the City, 
        often with limited access and multiple travel lanes in each direction.`},
        {
            types: 'Boulevard, Avenue, Street', description: `Major roads within more
        urbanized areas.`},
        { types: 'Road', description: `Major Roads in more suburban or rural areas.` },
        { types: 'Drive, Lane, Path, Trail, Way', description: `Neighborhood roads, more than one segment in length, connected at both ends to another street.` },
        { types: 'Court', description: `Cul-de-sacs and other roads with only one end connected to another street and no other intersections with other cross streets along its length. (“Court” should not be used for a street that is expected to be extended and connected with other streets in the future.)` },
        { types: 'Circle, Crescent, Loop', description: `Short roads that connect at both ends with a segment of the same street.` },
        { types: 'Plaza', description: `Should be used for commercial streets in shopping centers, office parks, and downtown areas.` },
        { types: 'Alley', description: `Service road that runs between, and generally parallel to, two streets.` }
    ],
    fields: {
        contact: ["contact", "organization", "email", "phone"],
        details: ["projectname",
            "plannumber",
            "pinnum",
            "address",
            "zipcode",
            "streetnamesneeded"]
    },
    geocodeUrl: "https://maps.raleighnc.gov/arcgis/rest/services/Locators/FindMyService/GeocodeServer",
    parcelsLayerId: "08050bf067bb4b20adea4b0b4f0a39e3",
    basemapLayerId: "109c9fa256a44e28a29a528ca18637e0",
    jurisdictionrUrl: "https://maps.wakegov.com/arcgis/rest/services/Jurisdictions/Jurisdictions/MapServer/1",
    zipLayerId: "41fcd86f6b0c459ebdc576763a9145cf",
    streetNamesId: "1e97845fd3434bf493097f9aa7390811",
    wakeCountySite: "https://www.wake.gov/departments-government/geographic-information-services-gis/addresses-road-names-and-street-signs/road-name-approval-guide"
};