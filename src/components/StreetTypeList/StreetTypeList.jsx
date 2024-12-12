import { config } from "../../config";

function StreetTypeList() {
  return (
    <>
      <ol>
        {config.streetTypes.map((type) => {
          return (
            <li key={type.types}>
              <strong>{type.types}: </strong>
              {type.description}
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default StreetTypeList;
