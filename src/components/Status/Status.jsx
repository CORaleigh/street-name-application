import { useState } from "react";

import {
  CalciteButton,
  CalciteList,
  CalciteListItem,
  CalciteDialog,
  CalciteNotice,
  CalcitePanel,
  CalciteBlock,
  CalciteBlockSection,
} from "@esri/calcite-components-react";
import "./Status.css";
import Streets from "../Streets/Streets";
import { submitAdditionalStreets } from "../../utils/form";
import PropTypes from "prop-types";
import { useStatus } from "./useStatus";
import ApplicationDetails from "../ApplicationDetails/ApplicationDetails";
import MapModal from "../MapModal/MapModal";
import { formLayer } from "../../utils/form";

function Status({ status }) {
  const {
    approvedStreets,
    inReviewStreets,
    rejectedStreets,
    feature,
    showSubmitStreets,
    setShowSubmitStreets,
    getNoticeMessage,
    getIcon,
    getKind,
  } = useStatus(status);
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <CalcitePanel>
        {feature && (
          <CalciteNotice
            open
            icon={getIcon(feature.getAttribute("status"))}
            kind={getKind(feature.getAttribute("status"))}
          >
            <div slot="title">{feature.getAttribute("status")}</div>
            <div slot="message">
              {getNoticeMessage(feature, approvedStreets)}
            </div>
          </CalciteNotice>
        )}

        {feature && (
          <ApplicationDetails
            feature={feature}
            attachments={[]}
            formLayer={formLayer}
            creds={undefined}
            setShowMap={setShowMap}
          ></ApplicationDetails>
        )}

        {feature && feature.getAttribute("status").includes("Rejected") && (
          <CalciteButton
            width="full"
            onClick={() => setShowSubmitStreets((prev) => !prev)}
            scale="l"
            iconEnd="plus"
          >
            Submit Additional Street Names
          </CalciteButton>
        )}
        <div></div>
        <CalciteBlock heading="Street Names" open collapsible>
          {inReviewStreets?.length > 0 && (
            <CalciteBlockSection
              text="In Review"
              iconStart="file-magnifying-glass"
              open
            >
              <CalciteList>
                {inReviewStreets.map((street) => (
                  <CalciteListItem
                    key={street.getAttribute("OBJECTID")}
                    label={`${street.getAttribute(
                      "streetname"
                    )} ${street.getAttribute("streettype")}`}
                  ></CalciteListItem>
                ))}
              </CalciteList>
            </CalciteBlockSection>
          )}
          {approvedStreets?.length > 0 && (
            <CalciteBlockSection text="Approved" iconStart="check" open>
              <CalciteList>
                {approvedStreets.map((street) => (
                  <CalciteListItem
                    key={street.getAttribute("OBJECTID")}
                    label={`${street.getAttribute(
                      "streetname"
                    )} ${street.getAttribute("streettype")}`}
                  ></CalciteListItem>
                ))}
              </CalciteList>
            </CalciteBlockSection>
          )}
          {rejectedStreets?.length > 0 && (
            <CalciteBlockSection text="Rejected" iconStart="x" open>
              <CalciteList>
                {rejectedStreets.map((street) => (
                  <CalciteListItem
                    key={street.getAttribute("OBJECTID")}
                    label={`${street.getAttribute(
                      "streetname"
                    )} ${street.getAttribute("streettype")}`}
                    description={street.getAttribute("Comments")}
                  ></CalciteListItem>
                ))}
              </CalciteList>
            </CalciteBlockSection>
          )}
        </CalciteBlock>
        <CalciteDialog
          heading="Submit Additional Streets"
          open={showSubmitStreets}
          placement="cover"
        >
          {approvedStreets && feature && (
            <Streets
              submit={async (submittedStreets) => {
                await submitAdditionalStreets(submittedStreets, feature);
                setShowSubmitStreets((prev) => !prev);
                window.location.reload();
              }}
              needed={
                feature.getAttribute("streetnamesneeded") -
                approvedStreets.length
              }
            ></Streets>
          )}
        </CalciteDialog>
      </CalcitePanel>
      <MapModal
        open={showMap}
        closed={() => setShowMap(false)}
        feature={status?.feature}
      ></MapModal>
    </>
  );
}
Status.propTypes = {
  status: PropTypes.any,
};
export default Status;
