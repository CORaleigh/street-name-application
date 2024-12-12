import {
  CalciteAction,
  CalciteBlock,
  CalciteButton,
  CalciteChip,
  CalciteInput,
  CalciteList,
  CalciteListItem,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteNavigationUser,
  CalciteNotice,
  CalciteOption,
  CalcitePanel,
  CalciteSelect,
  CalciteShell,
  CalciteTextArea,
} from "@esri/calcite-components-react";
import "./Approve.css";
import {
  formLayer,
} from "../../utils/form";
import {
  rejectDisabled,
  getIcon,
  getKind,
  getNoticeMessage,
  canEdit,
  streetApproveDisabled,
  approveDisabled,
} from "../../utils/approve";
import MapModal from "../MapModal/MapModal";
import PropTypes from "prop-types";
import { useApprove } from "./useApprove";
import ApplicationDetails from "../ApplicationDetails/ApplicationDetails";

function Approve({ approve }) {
  const { streetTypes, approvedStreets, inReviewStreets, rejectedStreets, feature, attachments, cityOrCounty, user, creds, showMap, setShowMap, handleApproveClicked, handleRejectClicked, handleStreetNameInputed, handleStreetTypeSelected, handleStreetApprovedClicked, handleStreetRejectedClicked, handleStreetEditClicked, handleStreetCommentEntered, handleSendBackToReview } = useApprove(approve);

  return (
    <>
      <CalciteShell>
        <CalciteNavigation slot="header">
          <CalciteNavigationLogo
            slot="logo"
            heading="Street Name Application"
            description="Staff approval form"
            thumbnail="logo.svg"
          ></CalciteNavigationLogo>
          <CalciteNavigationUser
            slot="user"
            fullName={user?.fullName}
            userId={user?.username}
          />
        </CalciteNavigation>

        {feature && (
          <>
            <CalcitePanel>
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
              <ApplicationDetails feature={feature} attachments={attachments} formLayer={formLayer} creds={creds} setShowMap={setShowMap}>
              </ApplicationDetails>
              {feature && (
                <CalciteChip kind="brand">
                  {feature.getAttribute("streetnamesneeded")}{" "}
                  {feature.getAttribute("streetnamesneeded") > 1
                    ? "Streets"
                    : "Street"}{" "}
                  Requested
                </CalciteChip>
              )}
              {feature && canEdit(feature, cityOrCounty) && (
                <div className="approve-buttons">
                  <CalciteButton
                    iconStart="check"
                    width="full"
                    disabled={approveDisabled(
                      feature,
                      inReviewStreets,
                      approvedStreets
                    )}
                    onClick={handleApproveClicked}
                  >
                    Approve{" "}
                    <CalciteChip scale="s">
                      {approvedStreets?.length}
                    </CalciteChip>
                  </CalciteButton>
                  <CalciteButton
                    iconStart="thumbs-down"
                    width="full"
                    disabled={rejectDisabled(
                      feature,
                      inReviewStreets,
                      approvedStreets
                    )}
                    onClick={handleRejectClicked}
                    kind="danger"
                  >
                    Reject{" "}
                    <CalciteChip scale="s">
                      {rejectedStreets?.length}
                    </CalciteChip>
                  </CalciteButton>
                </div>
              )}
              {inReviewStreets?.length > 0 && (
                <CalciteBlock
                  heading="Street Names In Review"
                  iconStart="file-magnifying-glass"
                  description={
                    feature.status === "City Review"
                      ? "Approve or reject every street name to submit."
                      : feature.status === "County Review"
                      ? "Approve or reject streets, you can only approve the number of required street names, others will be set to being not needed"
                      : ""
                  }
                  open
                  collapsible
                >
                  <CalciteList>
                    {inReviewStreets.map((street) => (
                      <CalciteListItem
                        key={street.getAttribute("OBJECTID")}
                        label={
                          street.isEditing
                            ? ""
                            : `${street.getAttribute(
                                "streetname"
                              )} ${street.getAttribute("streettype")}`
                        }
                      >
                        {street.isEditing && (
                          <div
                            className="editing-container"
                            slot="content-start"
                          >
                            <CalciteInput
                              value={street.getAttribute('streetname')}
                              onCalciteInputInput={(e) => handleStreetNameInputed(e, street)}
                            ></CalciteInput>
                            <CalciteSelect
                              value={street.getAttribute('streettype')}
                              onCalciteSelectChange={(e) => handleStreetTypeSelected(e, street)}
                            >
                              {streetTypes.map((type) => (
                                <CalciteOption
                                  key={type.code}
                                  value={type.code}
                                >
                                  {type.name}
                                </CalciteOption>
                              ))}
                            </CalciteSelect>
                          </div>
                        )}
                        {canEdit(feature, cityOrCounty) && (
                          <>
                            <CalciteAction
                              slot="actions-start"
                              icon="thumbs-up"
                              disabled={streetApproveDisabled(
                                feature,
                                approvedStreets
                              )}
                              onClick={() => handleStreetApprovedClicked(street)}
                              
                            ></CalciteAction>
                            <CalciteAction
                              slot="actions-start"
                              icon="thumbs-down"
                              onClick={() => handleStreetRejectedClicked(street)}
                              disabled={streetApproveDisabled(
                                feature,
                                approvedStreets
                              )}
                            ></CalciteAction>
                            <CalciteAction
                              slot="actions-start"
                              icon="pencil"
                              text="Edit"
                              disabled={streetApproveDisabled(
                                feature,
                                approvedStreets
                              )}                              
                              onClick={() => handleStreetEditClicked(street)}
                              active={street.isEditing ? "" : undefined}
                            ></CalciteAction>
                          </>
                        )}
                        {canEdit(feature, cityOrCounty) && (
                          <>
                            <div
                              className="approve-content"
                              slot="content-bottom"
                            >
                              <CalciteTextArea
                                placeholder="Enter comments..."
                                disabled={streetApproveDisabled(
                                  feature,
                                  approvedStreets
                                )}
                                value={street.getAttribute('comments')}
                                onCalciteTextAreaInput={(e) => handleStreetCommentEntered(e, street)}
                              ></CalciteTextArea>
                            </div>

                          </>
                        )}
                      </CalciteListItem>
                    ))}
                    
                  </CalciteList>


                <CalciteNotice icon="check" open={streetApproveDisabled(
                                feature,
                                approvedStreets
                              )}>
                                <div slot="message">The total number of streets requested have been approved</div>
                            </CalciteNotice>
                </CalciteBlock>
              )}
              {approvedStreets?.length > 0 && (
                <CalciteBlock heading="Approved Street Names" iconStart="check" collapsible open>
                  <CalciteList>
                    {approvedStreets.map((street) => (
                      <CalciteListItem
                        key={street.getAttribute("OBJECTID")}
                        label={`${street.getAttribute(
                          "streetname"
                        )} ${street.getAttribute("streettype")}`}
                      >
                        {((feature.getAttribute("status") === "City Review" &&
                          cityOrCounty === "city") ||
                          (feature.getAttribute("status") === "County Review" &&
                            cityOrCounty === "county")) && (
                          <CalciteAction
                            slot="actions-start"
                            icon="undo"
                            label="Send back to review"
                            onClick={() => handleSendBackToReview(street)}
                          ></CalciteAction>
                        )}
                      </CalciteListItem>
                    ))}
                  </CalciteList>
                </CalciteBlock>
              )}
              {rejectedStreets?.length > 0 && (
                <CalciteBlock heading="Rejected Street Names" collapsible open iconStart="x" >
                  <CalciteList>
                    {rejectedStreets.map((street) => (
                      <CalciteListItem
                        key={street.getAttribute("OBJECTID")}
                        label={`${street.getAttribute(
                          "streetname"
                        )} ${street.getAttribute("streettype")}`}
                        description={street.getAttribute("Comments")}
                      >
                        {(((feature.getAttribute("status") === "City Review" || feature.getAttribute("status") === "City Rejected") &&
                          cityOrCounty === "city") ||
                          ((feature.getAttribute("status") === "County Review" || feature.getAttribute("status") === "County Rejected") &&
                            cityOrCounty === "county")) && (
                          <div slot="actions-start">
                            <CalciteAction
                              label="Send back to review"
                              appearance="outline-fill"
                              kind="neutral"
                              icon="undo"
                              onClick={() => handleSendBackToReview(street)}
                              ></CalciteAction>
                          </div>
                        )}
                      </CalciteListItem>
                    ))}
                  </CalciteList>
                </CalciteBlock>
              )}
            </CalcitePanel>
          </>
        )}

        {/* <CalciteAccordion> */}
      </CalciteShell>
      <MapModal
        open={showMap}
        closed={() => setShowMap(false)}
        feature={approve?.feature}
      ></MapModal>
    </>
  );
}

Approve.propTypes = {
  approve: PropTypes.any, // Replace `any` with the actual type if known
};
export default Approve;
