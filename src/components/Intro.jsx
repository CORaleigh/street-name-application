import StreetNameRules from "./StreetNameRules";
import StreetTypeList from "./StreetTypeList";

function Intro() {
  return (
    <div className="intro">
      <h3>GUIDELINES FOR SELECTING STREET NAMES</h3>
      <strong>
        Submitting this application does not mean all of the streets will be
        approved. City and County staff will further review the streets and
        reach out if more streets are needed or if changes need to be made.
      </strong>
      <br />
      <p>
        City and County staff will determine whether the names submitted in this
        application are acceptable. Please consider the following guidelines
        when selecting your possible road names:
      </p>
      <StreetNameRules></StreetNameRules>

      <p>
        The following street type definitions should be used when selecting
        possible street names to better the chances of submitting an approvable
        street name:
      </p>
      <StreetTypeList></StreetTypeList>

      <strong>Have you read and agree to the above guidlines?</strong>
      <br />
      <br />
    </div>
  );
}

export default Intro;
