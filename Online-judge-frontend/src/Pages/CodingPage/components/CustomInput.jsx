import React from "react";
import { classnames } from "../utils/general";

const CustomInput = ({ customInput, setCustomInput }) => {
  return (
    <textarea
      rows="5"
      value={customInput}
      onChange={(e)=>setCustomInput(e.target.value)}
      placeholder={`Custom input`}
      className={classnames(
        "focus:outline-none w-full h-full min-h-[130px] border-2 border-black z-10 rounded-md bg-white resize-none"
      )}
    >

    </textarea>
  );
};

export default CustomInput;
