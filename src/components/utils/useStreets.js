import { useEffect, useState } from "react";
import { getStreetTypes, checkStreetNames } from "./form";
const useStreets = props => {
  const [streets, setStreets] = useState([
    {
      name: { value: null, valid: false, reason: "Street name required" },
      type: { value: null, valid: false, reason: "Street type required" },
    },
  ]);
    const [streetTypes, setStreetTypes] = useState([
    {
      name: "Select street type...",
      code: null,
    },
  ]);
  const [streetsSubmitting, setStreetsSubmitting] = useState(1);
  const updateStreets = (e) => {
    if (parseInt(e.target.value) < streetsSubmitting) {
      setStreets(streets.slice(0, -1));
    } else {
        const newStreets = streets.filter((street, i) => {
            return i < parseInt(e.target.value);
        });
        for (let i = newStreets.length; i < parseInt(e.target.value);i++) {
            newStreets.push({
                name: { value: null, valid: false, reason: "Street name required" },
                type: { value: null, valid: false, reason: "Street type required" },
            });
        }
    //   const addStreets = [];
    //   for (let i = streets.length; i < parseInt(e.target.value); i++) {
    //     addStreets.push({
    //       name: { value: null, valid: false, reason: "Street name required" },
    //       type: { value: null, valid: false, reason: "Street type required" },
    //     });
    //   }
      //setStreets([...streets, ...addStreets]);
      setStreets(newStreets);
    }

   // setStreetsSubmitting(parseInt(e.target.value));
  };
const streetNameChanged = async (e, i) => {
  
    const result = await checkStreetNames(e.target.value, streetTypes);
    const newStreets = streets.map((street, index) => {
      if (index === i) {
        street.name = {
          value: e.target.value,
          valid: result.valid,
          reason: result.reason,
        };
      }
      return street;
    });
    setStreets(newStreets);
  };
  const streetTypeChanged = async (e, i) => {
    let result = { valid: true, reason: null };
    if (!e.target.selectedOption.value) {
      result = { valid: false, reason: "Street type required" };
    }
    const newStreets = streets.map((street, index) => {
      if (index === i) {
        street.type = {
          value: e.target.selectedOption.value,
          valid: result.valid,
          reason: result.reason,
        };
      }
      return street;
    });
    setStreets(newStreets);
  };
  useEffect(() => {
    (async _ => setStreetTypes([...streetTypes, ...(await getStreetTypes())]))()
  }, []);
  return {updateStreets, streets, streetTypes, streetNameChanged, streetTypeChanged}
}
export default useStreets;