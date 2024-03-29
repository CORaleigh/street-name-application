import {
  CalciteButton,
  CalciteLink,
  CalciteModal,
} from "@esri/calcite-components-react";

function SubmittedModal(props) {
  return (
    <CalciteModal
      open={props.open ? true : undefined}
      aria-labelledby="modal-title"
      id="success-modal"
      onCalciteModalClose={(_) => {
        window.location.reload();
        props.closed();
      }}
    >
      <div slot="header" id="modal-title">
        Application Submitted
      </div>
      <div slot="content">
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
            href={`${window.location.origin}${window.location.pathname}?mode=status&id=${props.id?.toLowerCase()}`}
            target="_blank"
          >
            {`${window.location.origin}${window.location.pathname}?mode=status&id=${props.id?.toLowerCase()}`}
          </CalciteLink>
        </p>
      </div>
      <CalciteButton slot="primary" onClick={(_) => props.closed()}>
        Dismiss
      </CalciteButton>
    </CalciteModal>
  );
}

export default SubmittedModal;
