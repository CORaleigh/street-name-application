import { useState } from "react";

export const useAttachments = (attachments) => {
    const [files, setFiles] = useState([{}]);
    const [fileLimit, setFileLimit] = useState(false);
    const fileChanged = (e, i) => {
      var file = e.target.files[0];
      console.log(file.size);
      if (file.size * 0.000001 <= 10) {
        const newfiles = files.map((f, index) => {
          if (index === i) {
            f.name = file.name;
          }
          return f;
        });
        setFiles(newfiles);
        setFileLimit(false);
      } else {
        removeFile();
        setFileLimit(true);
      }
    };
    const removeFile = () => {
      setFiles([...[], ...[{}]]);
      const dt = new DataTransfer();
      attachments.current.querySelector("input").files = dt.files;
    };
    return { files, fileChanged, removeFile, fileLimit }
}