function StreetNameRules() {
    return (

      <ol>
      <li>An Individual person's name is not allowed</li>
      <li>
        Directionals and numbers are not allowed e.g. North Star Ln; Four
        Corners Dr
      </li>
      <li>
        Punctuation is not allowed e.g. periods, hyphens, apostrophes
      </li>
      <li>All names must have an acceptable type e.g. Road, Lane, Path</li>
      <li>Double street types are not allowed: e.g. Deer Path Lane</li>
      <li>
        Names must be easy to pronounce and should effect a positive
        connotation
      </li>
      <li>
        Names duplicating or sounding similar to existing names will be
        rejected.
      </li>
      <ul>
        <li>
          <em>
            note: this is only the street name, not the street type. For
            example, if a Main St exists, Main Dr is considered a duplicate.
          </em>
        </li>
      </ul>
      <li>
        Limit name to 20 characters in length (including spaces), due to sign-space
        limitations Every road planned must be named.
      </li>
    </ol>

    );
  }
  
  export default StreetNameRules;
  