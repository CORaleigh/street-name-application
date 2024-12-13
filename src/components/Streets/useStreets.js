import { useEffect, useState } from "react";
import {
  loadStreetTypes,
  streetNameChanged,
  streetTypeChanged,
} from "../../utils/streets";
export const useStreets = (needed, submit) => {
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
  const [streetTypesLoaded, setStreetTypesLoaded] = useState(false);
  const deleteStreet = (elementToRemove) => {
    setStreets((prev) => {
      const newStreets = prev.filter((street) => street !== elementToRemove);
      console.log(prev);
      console.log(newStreets);
      return newStreets;
    });
  };
  const getAlertKind = () => {
    const validCnt = streets.filter((s) => s.name.valid && s.type.valid).length;
    const neededCnt = parseInt(needed);
    if (validCnt < neededCnt) {
      return "danger";
    } else if (validCnt > neededCnt) {
      return "success";
    } else {
      return "warning";
    }
  };
  const handleSubmitClick = () => submit(streets);

  const handleStreetNameInput = async (e) => {

    const updatedStreets = await streetNameChanged(
      e,
      parseInt(e.target.dataset.index),
      streets,
      streetTypes
    );
    setStreets(updatedStreets);


  }
  const handleStreetTypeSelect = async (e) => {

    const updatedStreets = await streetTypeChanged(
      e,
      parseInt(e.target.dataset.index),
      streets
    );
    setStreets(updatedStreets);


  }

  const addStreet = () => setStreets((prev) => [
    ...prev,
    {
      name: {
        value: null,
        valid: false,
        reason: "Street name required",
      },
      type: {
        value: null,
        valid: false,
        reason: "Street type required",
      },
    },
  ])

  const getAlertMessage = () => {
    const validCnt = streets.filter((s) => s.name.valid && s.type.valid).length;
    const neededCnt = parseInt(needed);
    if (validCnt < neededCnt) {
      return `${validCnt} valid ${validCnt === 1 ? "street" : "streets"
        } entered, ${neededCnt - validCnt} more needed`;
    } else if (validCnt > neededCnt) {
      return `${validCnt} valid ${validCnt === 1 ? "street" : "streets"
        } entered, 0 more needed`;
    } else {
      return `${validCnt} valid ${validCnt === 1 ? "street" : "streets"
        } entered, it is recommended to enter more than needed`;
    }
  };
  useEffect(() => {
    (async () => {
      if (!streetTypesLoaded) {
        setStreetTypes([...streetTypes, ...(await loadStreetTypes())]);
        setStreetTypesLoaded(true);
      }
    })();
  }, []);
  useEffect(() => {
    setStreets((prevStreets) => {
      const additionalStreetsCount = needed - prevStreets.length;
      if (additionalStreetsCount > 0) {
        const newStreets = Array.from({ length: additionalStreetsCount }, () => ({
          name: { value: null, valid: false, reason: "Street name required" },
          type: { value: null, valid: false, reason: "Street type required" },
        }));
        return [...prevStreets, ...newStreets];
      }
      return prevStreets;
    });
  }, [needed]);
  return {
    streets, streetTypes, addStreet, deleteStreet, getAlertMessage, getAlertKind,
    handleSubmitClick, handleStreetNameInput, handleStreetTypeSelect
  };
}