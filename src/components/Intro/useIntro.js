import { useEffect, useState } from "react";

export const useIntro = (stepChanged, nextStep, agreed) => {
  const [showModal, setShowModal] = useState({ rules: false, types: false });

  useEffect(() => {
    setShowModal({ rules: false, types: false });
  }, [stepChanged]);

  const toggleModal = (type) => {
    setShowModal((prev) => ({
      rules: type === "rules" ? !prev.rules : false,
      types: type === "types" ? !prev.types : false,
    }));
  };

  const handleAgree = () => {
    nextStep("Contact Info");
    agreed();
    setShowModal({ rules: false, types: false });
  };
  return { showModal, toggleModal, handleAgree }
}