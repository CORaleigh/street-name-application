
  import { useEffect, useRef, useState } from "react";
  import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
  import FeatureTable from '@arcgis/core/widgets/FeatureTable';
  import Feature from '@arcgis/core/widgets/Feature';
import { checkAuthentication } from "./utils/authenticate";
import { CalciteButton, CalciteTab, CalciteTabNav, CalciteTabTitle, CalciteTabs } from "@esri/calcite-components-react";

  function StreetApprovalList(props) {
    const ref = useRef(null);
    const featureRef = useRef(null);

    const appLayer = new FeatureLayer({
        portalItem: {
          id: "f922bf8d5c8d442ba4355c9499e69f02",
        },
        layerId: 0,
      });        
    const streetTable = new FeatureLayer({
        portalItem: {
          id: "f922bf8d5c8d442ba4355c9499e69f02",
        },
        layerId: 1,
      });    
    const [streetsNeeded, setStreetsNeeded] = useState();
    const [cityApproved, setCityApproved] = useState();
    const [countyApproved, setCountyApproved] = useState();
    const [cityOrCounty, setCityOrCounty] = useState();
    const [selectedTab, setSelectedTab] = useState('Application');
    let oid = null;
    const approve = () => {
        console.log({attributes: {OBJECTID: oid, attributes: {status: cityOrCounty === 'city' ? 'City Approved' : cityOrCounty === 'county' ? 'County Approved' : null}}});
    };
    useEffect(() => {
      if (props.id) {
        (async () => {
            const userId = await checkAuthentication();
            setCityOrCounty(userId.toLowerCase().includes('raleigh') ? 'city' : userId.toLowerCase().includes('wake') ? 'county' : undefined);

            await appLayer.load();
            const result = await appLayer.queryFeatures({where: `GlobalID = '${props.id}'`, outFields:['*']});
            if (result.features.length) {
                const feature = new Feature({
                    container: featureRef.current,
                    graphic: result.features[0]
                });
                setStreetsNeeded(result.features[0].getAttribute('streetnamesneeded'));
                oid = result.features[0].getAttribute('OBJECTID');
            }
            await streetTable.load();
   
            streetTable.fields.forEach(field => {
                if (field.name === 'countyapproved' && !userId.includes('wake')) {
                    field.editable = false;
                }
                if (field.name === 'cityapproved' && !userId.includes('raleigh')) {
                    field.editable = false;
                }                
            });
            setCityApproved(await streetTable.queryFeatureCount({
                where: `cityapproved = 'Yes'`
            }));
            setCountyApproved(await streetTable.queryFeatureCount({
                where: `countyapproved = 'Yes'`
            }));                 
            streetTable.definitionExpression = `applicationid = '${props.id}'`
            const table = new FeatureTable({
                container: ref.current,
                layer: streetTable,
                editingEnabled: true,
                hiddenFields: ['applicationid', 'GlobalID','OBJECTID', 'soundscore', 'created_user','created_date', 'last_edited_user', 'last_edited_date'],
                visibleElements: {'columnMenus': false, 'header': false, selectionColumn: false}
            });
            streetTable.on('edits', async (e) => {
                setCityApproved(await streetTable.queryFeatureCount({
                    where: `cityapproved = 'Yes'`
                }));
                setCountyApproved(await streetTable.queryFeatureCount({
                    where: `countyapproved = 'Yes'`
                }));     
                
            })
            // const result = streetTable.queryFeatures({
            //     where: `applicationid = '${props.id}`,
            //     outFields
            // })
        })();
      }
    }, [props.id]);
    return (
        <CalciteTabs scale="l">
            <CalciteTabNav slot="title-group" onCalciteTabChange={ e => {
               requestAnimationFrame(() => setSelectedTab(e.target.selectedTitle.textContent));
            }}>
                <CalciteTabTitle selected={selectedTab === 'Application' ? true : undefined}>Application</CalciteTabTitle>
                <CalciteTabTitle selected={selectedTab === 'Streets' ? true : undefined}>Streets</CalciteTabTitle>
            </CalciteTabNav>
            <CalciteTab  selected={selectedTab === 'Application' ? true : undefined}>
            <div ref={featureRef}></div>

            </CalciteTab>
            <CalciteTab selected={selectedTab === 'Streets' ? true : undefined}>
            <div className="approval-list">
                    <div ref={ref}></div>

                </div>
                <div className="approve-buttons">
                    <CalciteButton width="full" disabled={
                        (cityOrCounty === 'city' && cityApproved < streetsNeeded) ||
                        (cityOrCounty === 'county' && countyApproved < streetsNeeded) ? true : undefined
                    } onClick={approve}>Approve</CalciteButton>
                    <CalciteButton  disabled={
                        (cityOrCounty === 'city' && cityApproved >= streetsNeeded) ||
                        (cityOrCounty === 'county' && countyApproved >= streetsNeeded) ? true : undefined
                    } width="full" kind="danger">Reject</CalciteButton>
                </div>
            </CalciteTab>            
        </CalciteTabs>

    );
  }
  
  export default StreetApprovalList;
  