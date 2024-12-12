import {
  CalciteButton,
  CalciteLink,
  CalciteDialog,
} from "@esri/calcite-components-react";
import PropTypes from "prop-types";
import { useEffect } from "react";

function SubmittedModal({open, closed, id}) {
  useEffect(() => {
    console.log(open)
  },[open])
  return (
    <CalciteDialog
      heading="Application Submitted"
      open={open ? true : undefined}
      aria-labelledby="modal-title"
      id="success-modal"
      onCalciteDialogClose={() => {
        window.location.reload();
        closed();
      }}
    >

        Your applicaiton has been successfully submitted. Staff at the City of
        Raleigh and Wake County will review your application. Once approved, you
        will receive a copy of the application. Applications are typically
        reviewed on Thursdays. If you do not receive an email within 30 minutes,
        please email us at{" "}
        <CalciteLink
          iconStart="email-address"
          href="mailto:RaleighAddressing@raleighnc.gov"
          target="_blank"
        >
          RaleighAddressing@raleighnc.gov
        </CalciteLink>
        .
        <p>
          Check your application status at{" "}
          <CalciteLink
            iconStart="email-address"
            href={`${window.location.origin}${window.location.pathname}?mode=status&id=${id?.toLowerCase()}`}
            target="_blank"
          >
            {`${window.location.origin}${window.location.pathname}?mode=status&id=${id?.toLowerCase()}`}
          </CalciteLink>
        </p>
      <CalciteButton slot="footer-end" onClick={() => closed()}>
        Dismiss
      </CalciteButton>
    </CalciteDialog>
  );
}
SubmittedModal.propTypes = {
  open: PropTypes.bool.isRequired,
  closed: PropTypes.func,
  id: PropTypes.any


};
export default SubmittedModal;
