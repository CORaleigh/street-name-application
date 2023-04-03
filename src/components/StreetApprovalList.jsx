
  import { useEffect, useRef, useState } from "react";
  import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
  import FeatureTable from '@arcgis/core/widgets/FeatureTable';
  import Feature from '@arcgis/core/widgets/Feature';

  function StreetApprovalList(props) {
    const ref = useRef(null);
    const featureRef = useRef(null);

    const appLayer = new FeatureLayer({
        portalItem: {
          id: "155f0425df84404eb3a9b67cfcbece15",
        },
        layerId: 0,
      });        
    const streetTable = new FeatureLayer({
        portalItem: {
          id: "155f0425df84404eb3a9b67cfcbece15",
        },
        layerId: 1,
      });    
    useEffect(() => {
      if (props.id) {
        (async () => {
            await appLayer.load();
            const result = await appLayer.queryFeatures({where: `GlobalID = '${props.id}'`});
            if (result.features.length) {
                const feature = new Feature({
                    container: featureRef.current,
                    graphic: result.features[0]
                })
            }
            await streetTable.load();
            streetTable.definitionExpression = `applicationid = '${props.id}'`
            const table = new FeatureTable({
                container: ref.current,
                layer: streetTable,
                editingEnabled: true,
                hiddenFields: ['applicationid', 'GlobalID','OBJECTID', 'soundscore', 'created_user','created_date', 'last_edited_user', 'last_edited_date'],
                visibleElements: {'columnMenus': false, 'header': false, selectionColumn: false}
            });
            // const result = streetTable.queryFeatures({
            //     where: `applicationid = '${props.id}`,
            //     outFields
            // })
        })();
      }
    }, [props.id]);
    return (
      <div className="approval-list"><div ref={featureRef}></div><div ref={ref}></div>
      </div>
    );
  }
  
  export default StreetApprovalList;
  