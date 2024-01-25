import {
  CalciteAccordion,
  CalciteAccordionItem,
  CalciteAction,
  CalciteButton,
  CalciteChip,
  CalciteFab,
  CalciteInput,
  CalciteLink,
  CalciteList,
  CalciteListItem,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteNavigationUser,
  CalciteNotice,
  CalciteOption,
  CalciteSelect,
  CalciteShell,
  CalciteTextArea,
} from "@esri/calcite-components-react";
import { useEffect, useState } from "react";
import "./Approve.css";
import {
  approveApplication,
  changeStreetStatus,
  formLayer,
  rejectApplication,
} from "./utils/form";
import { loadStreetTypes, streetCommentChanged } from "./utils/streets";
import { checkAuthentication } from "./utils/authenticate";
import {
  updateInReviewStreetType,
  toggleEditing,
  updateInReviewStreetName,
  rejectDisabled,
  getIcon,
  getKind,
  getNoticeMessage,
  getApprovedStreets,
  getRejectedStreets,
  getInReviewStreets,
  canEdit,
  streetApproveDisabled,
  approveDisabled
} from "./utils/approve";
import MapModal from "./MapModal";

function Approve(props) {
  

  const [streets, setStreets] = useState([]);
  const [approvedStreets, setApprovedStreets] = useState([]);
  const [inReviewStreets, setInReviewStreets] = useState([]);
  const [rejectedStreets, setRejectedStreets] = useState([]);
  const [feature, setFeature] = useState();
  const [attachments, setAttachments] = useState([]);
  const [user, setUser] = useState();
  const [creds, setCreds] = useState();
  const [cityOrCounty, setCityOrCounty] = useState();
  const [streetTypes, setStreetTypes] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    setFeature(props.approve?.feature);
    setStreets(props.approve?.streets);
    setAttachments(props.approve?.attachments);
  }, [props.approve]);

  useEffect(() => {
    if (streets) {
      setApprovedStreets(getApprovedStreets(props.approve?.feature, streets));
      setRejectedStreets(getRejectedStreets(props.approve?.feature, streets));
      setInReviewStreets(getInReviewStreets(props.approve?.feature, streets));
      setTimeout(() => {
        document.querySelectorAll("calcite-list-item")?.forEach((i) => {
          i.shadowRoot
            .querySelector(".container")
            ?.addEventListener("mouseover", (e) =>
              e.currentTarget.setAttribute("style", "background: none;")
            );
        });
      }, 500);
    }
  }, [streets]);
  useEffect(() => {
    if (!user) {
      (async () => {
        const creds = await checkAuthentication();
        setUser(creds?.user);
        setCreds(creds?.creds);
        setCityOrCounty(
          creds?.user.username.toLowerCase().includes("raleigh")
            ? "city"
            : creds.username.toLowerCase().includes("wake")
            ? "county"
            : undefined
        );
      })();
    }
    (async () => {
      setStreetTypes([...streetTypes, ...(await loadStreetTypes())]);
    })();
  }, []);
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
            <CalciteNotice
              open
              icon={getIcon(feature.getAttribute("status"))}
              kind={getKind(feature.getAttribute("status"))}
            >
              <div slot="title">{feature.getAttribute("status")}</div>
              <div slot="message">{getNoticeMessage(feature)}</div>
            </CalciteNotice>

            <CalciteAccordion>
              <CalciteAccordionItem heading="Application Details" expanded>
                <h3>Contact</h3>
                <div>{feature.getAttribute("contact")}</div>
                {feature.getAttribute("organization") && (
                  <div>{feature.getAttribute("organization")}</div>
                )}
                {feature.getAttribute("email") && (
                  <div>
                    <CalciteLink
                      href={`mailto:${feature.getAttribute("email")}/`}
                    >
                      {feature.getAttribute("email")}
                    </CalciteLink>
                  </div>
                )}
                {feature.getAttribute("phone") && (
                  <div>{feature.getAttribute("phone")}</div>
                )}
                <h3>Project</h3>
                {feature.getAttribute("projectname") && (
                  <div>
                    <strong>Project Name: </strong>
                    {feature.getAttribute("projectname")}
                  </div>
                )}
                {feature.getAttribute("plannumber") && (
                  <div>
                    <strong>Plan Number: </strong>
                    {feature.getAttribute("plannumber")}
                  </div>
                )}
                {feature.getAttribute("address") && (
                  <div>
                    <strong>Address: </strong>
                    {feature.getAttribute("address")}
                  </div>
                )}
                {feature.getAttribute("zipcode") && (
                  <div>
                    <strong>ZIP Code: </strong>
                    {feature.getAttribute("zipcode")}
                  </div>
                )}
                {feature.getAttribute("pinnum") && (
                  <div>
                    <strong>PIN Number: </strong>
                    {feature.getAttribute("pinnum")}
                  </div>
                )}
                <h3>Attachments</h3>
                <div className="attachments">
                  {attachments?.map((attachment, i) => (
                    <CalciteLink
                      target="_blank"
                      iconStart="download"
                      key={`attachment${i}`}
                      href={`${formLayer.url}/${formLayer.layerId}/${attachment.parentObjectId}/attachments/${attachment.id}/?token=${creds?.token}`}
                    >
                      {attachment.name}
                    </CalciteLink>
                  ))}
                </div>
                <CalciteButton iconEnd="map" onClick={() => setShowMap(true)}>
                  View Map
                </CalciteButton>
              </CalciteAccordionItem>
            </CalciteAccordion>
          </>
        )}
        {feature && (
          <CalciteChip>
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
              disabled={approveDisabled(feature, inReviewStreets, approvedStreets)}
              onClick={() => approveApplication(props.approve.feature, streets)}
            >
              Approve{" "}
              <CalciteChip scale="s">{approvedStreets?.length}</CalciteChip>
            </CalciteButton>
            <CalciteButton
              iconStart="thumbs-down"
              width="full"
              disabled={rejectDisabled(feature, inReviewStreets, approvedStreets)}
              onClick={() => rejectApplication(feature, streets)}
              kind="danger"
            >
              Reject{" "}
              <CalciteChip scale="s">{rejectedStreets?.length}</CalciteChip>
            </CalciteButton>
          </div>
        )}

        <div></div>
        <CalciteAccordion>
          {inReviewStreets?.length > 0 && (
            <CalciteAccordionItem
              heading="Street Names In Review"
              description={
                feature.status === "City Review"
                  ? "Approve or reject every street name to submit."
                  : feature.status === "County Review"
                  ? "Approve or reject streets, you can only approve the number of required street names, others will be set to being not needed"
                  : ""
              }
              expanded
            >
              <CalciteList>
                {inReviewStreets.map((street, i) => (
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
                      <div className="editing-container" slot="content-start">
                        <CalciteInput
                          value={street.getAttribute("streetname")}
                          onCalciteInputInput={async (e) =>
                            setStreets(
                              await updateInReviewStreetName(e, street, streets)
                            )
                          }
                        ></CalciteInput>
                        <CalciteSelect
                          value={street.getAttribute("streettype")}
                          onCalciteSelectChange={async (e) =>
                            setStreets(
                              await updateInReviewStreetType(e, street, streets)
                            )
                          }
                        >
                          {streetTypes.map((type) => (
                            <CalciteOption key={type.code} value={type.code}>
                              {type.name}
                            </CalciteOption>
                          ))}
                        </CalciteSelect>
                      </div>
                    )}
                    {canEdit(feature, cityOrCounty) && (
                      <CalciteAction
                        slot="actions-start"
                        icon="pencil"
                        text="Edit"
                        onClick={async () =>
                          setStreets(await toggleEditing(street, streets))
                        }
                        active={street.isEditing ? "" : undefined}
                      ></CalciteAction>
                    )}
                    {canEdit(feature, cityOrCounty) && (
                      <div className="approve-content" slot="content-bottom">
                        <CalciteFab
                          label="Approve"
                          disabled={streetApproveDisabled(feature, approvedStreets)}
                          icon="check"
                          kind="brand"
                          appearance="outline-fill"
                          onClick={async () =>
                            setStreets(
                              await changeStreetStatus(
                                street,
                                "approve",
                                streets,
                                feature
                              )
                            )
                          }
                        ></CalciteFab>
                        <CalciteFab
                          label="Reject"
                          disabled={streetApproveDisabled(feature, approvedStreets)}
                          icon="thumbs-down"
                          kind="danger"
                          appearance="outline-fill"
                          onClick={async () =>
                            setStreets(
                              await changeStreetStatus(
                                street,
                                "reject",
                                streets,
                                feature
                              )
                            )
                          }
                        ></CalciteFab>
                        <CalciteTextArea
                          placeholder="Enter comments..."
                          disabled={streetApproveDisabled(feature, approvedStreets)}
                          value={street.getAttribute("Comments")}
                          onCalciteTextAreaInput={async (e) => {
                            e.target.setAttribute("clearable", true);
                            setStreets(
                              await streetCommentChanged(e, street, streets)
                            );
                          }}
                        ></CalciteTextArea>
                      </div>
                    )}
                  </CalciteListItem>
                ))}
              </CalciteList>
            </CalciteAccordionItem>
          )}
          {approvedStreets?.length > 0 && (
            <CalciteAccordionItem heading="Approved Street Names" expanded>
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
                      <div slot="actions-start">
                        <CalciteFab
                          label="Send back to review"
                          appearance="outline-fill"
                          kind="neutral"
                          icon="undo"
                          onClick={async () =>
                            setStreets(
                              await changeStreetStatus(
                                street,
                                "review",
                                streets,
                                feature
                              )
                            )
                          }
                        ></CalciteFab>
                      </div>
                    )}
                  </CalciteListItem>
                ))}
              </CalciteList>
            </CalciteAccordionItem>
          )}
          {rejectedStreets?.length > 0 && (
            <CalciteAccordionItem heading="Rejected Street Names" expanded>
              <CalciteList>
                {rejectedStreets.map((street) => (
                  <CalciteListItem
                    key={street.getAttribute("OBJECTID")}
                    label={`${street.getAttribute(
                      "streetname"
                    )} ${street.getAttribute("streettype")}`}
                    description={street.getAttribute("Comments")}
                  >
                    {((feature.getAttribute("status") === "City Review" &&
                      cityOrCounty === "city") ||
                      (feature.getAttribute("status") === "County Review" &&
                        cityOrCounty === "county")) && (
                      <div slot="actions-start">
                        <CalciteFab
                          label="Send back to review"
                          appearance="outline-fill"
                          kind="neutral"
                          icon="undo"
                          onClick={async () =>
                            setStreets(
                              await changeStreetStatus(
                                street,
                                "review",
                                streets,
                                feature
                              )
                            )
                          }
                        ></CalciteFab>
                      </div>
                    )}
                  </CalciteListItem>
                ))}
              </CalciteList>
            </CalciteAccordionItem>
          )}
        </CalciteAccordion>
      </CalciteShell>
      <MapModal
        open={showMap}
        closed={() => setShowMap(false)}
        feature={props?.approve?.feature}
      ></MapModal>
    </>
  );
}

export default Approve;
