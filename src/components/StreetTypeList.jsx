function StreetTypeList() {
    return (

        <ol>
          <li>
            <strong>
             Parkway:{' '}
            </strong>
            Major highways or arterials through the City, often with limited
            access and multiple travel lanes in each direction.
          </li>
          <li>
            <strong>Boulevard, Avenue, Street</strong>: Major roads within more
            urbanized areas.
          </li>
          <li>
            <strong>Road</strong>: Major Roads in more suburban or rural areas.
          </li>
          <li>
            <strong>Drive, Lane, Path, Trail, Way</strong>: Neighborhood roads,
            more than one segment in length, connected at both ends to another
            street.
          </li>
          <li>
            <strong>Court</strong>: Cul-de-sacs and other roads with only
            one end connected to another street and no other intersections with
            other cross streets along its length. (“Court” should not be used for
            a street that is expected to be extended and connected with other
            streets in the future.)
          </li>
          <li>
            <strong>Circle, Crescent, Loop</strong>: Short roads that connect at
            both ends with a segment of the same street.
          </li>
          <li>
            <strong>Plaza</strong>: Should be used
            for commercial streets in shopping centers, office parks, and downtown
            areas.
          </li>
          <li>
            <strong>Alley</strong>: Service road that runs between, and generally
            parallel to, two streets.
          </li>
        </ol>

    );
  }
  
  export default StreetTypeList;
  