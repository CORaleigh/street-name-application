import { useEffect, useState } from "react";


import { checkAuthentication } from "../../utils/authenticate";
import { loadStreetTypes, streetCommentChanged } from "../../utils/streets";
import {
  approveApplication,
  rejectApplication,
  changeStreetStatus
} from "../../utils/form";
import {
  getApprovedStreets,
  getRejectedStreets,
  getInReviewStreets,
  updateInReviewStreetName,
  updateInReviewStreetType,
  toggleEditing
} from "../../utils/approve";

export const useApprove = (approve) => {


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

  const handleApproveClicked = () => approveApplication(approve.feature, streets)
  const handleRejectClicked = () => rejectApplication(feature, streets)
  const handleStreetNameInputed = async (e, street) =>
    setStreets(
      await updateInReviewStreetName(
        e,
        street,
        streets
      )
    );

  const handleStreetTypeSelected = async (e, street) => setStreets(
    await updateInReviewStreetType(
      e,
      street,
      streets
    )
  )

  const handleStreetApprovedClicked = async (street) =>
    setStreets(
      await changeStreetStatus(
        street,
        "approve",
        streets,
        feature
      )
    )

  const handleStreetRejectedClicked = async (street) =>
    setStreets(
      await changeStreetStatus(
        street,
        "reject",
        streets,
        feature
      )
    )

  const handleStreetEditClicked = async (street) => setStreets(await toggleEditing(street, streets))

  const handleStreetCommentEntered = async (e, street) => {
    e.target.setAttribute("clearable", true);
    setStreets(
      await streetCommentChanged(
        e,
        street,
        streets
      )
    );
  }



  const handleSendBackToReview = async (street) => setStreets(
    await changeStreetStatus(
      street,
      "review",
      streets,
      feature
    )
  )



  useEffect(() => {
    setFeature(approve?.feature);
    setStreets(approve?.streets);
    setAttachments(approve?.attachments);
  }, [approve]);

  useEffect(() => {
    if (streets) {

      setApprovedStreets(getApprovedStreets(approve?.feature, streets));
      setRejectedStreets(getRejectedStreets(approve?.feature, streets));
      setInReviewStreets(getInReviewStreets(approve?.feature, streets));
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
  }, [approve?.feature, streets]);
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
  return { streetTypes, approvedStreets, inReviewStreets, rejectedStreets, feature, attachments, cityOrCounty, user, creds, showMap, setShowMap, handleApproveClicked, handleRejectClicked, handleStreetNameInputed, handleStreetTypeSelected, handleStreetApprovedClicked, handleStreetRejectedClicked, handleStreetEditClicked, handleStreetCommentEntered, handleSendBackToReview }
}


