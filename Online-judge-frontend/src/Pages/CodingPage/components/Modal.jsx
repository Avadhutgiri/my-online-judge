import React, { useRef, useState } from "react";



export default function Modal({ onClose }) {
  const [save, setSave] = useState(false);
  const textRef = useRef(null);

  const handleCopy = () => {
    if (textRef.current) {
      textRef.current.select();
      document.execCommand('copy');
      textRef.current.blur();
      setSave(true);
      setTimeout(() => {
        window.getSelection().removeAllRanges(); 
        setSave(false);
      }, 2000); // Deselect after 2 seconds
    }
  };
  

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto">
          {/* content */}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-slate-900 outline-none focus:outline-none">
            {/* footer */}
            <div className="flex items-center justify-between pt-6 pl-6 pr-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded border-[2.3px]"
                type="button"
                onClick={handleCopy}
              >
                <img className="h-6 w-6"src="src/assets/copy4.png"/>
              </button>

              <button
                className="bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded text-xl  border-[2.3px]"
                type="button"
                onClick={onClose}
              >
                X
              </button>
            </div>
            <textarea
              ref={textRef}
              className="text-white relative p-6 flex-auto h-[59vh] w-[60vw] max-h-[59vh] border-2 border-white m-6 resize-none overflow-y-scroll bg-slate-800"
              defaultValue="Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sit nobis blanditiis sint saepe esse ex, nisi a consectetur amet soluta totam magni quibusdam non architecto aspernatur facilis deserunt incidunt id. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sit nobis blanditiis sint saepe esse ex, nisi a consectetur amet soluta totam magni quibusdam non architecto aspernatur facilis deserunt incidunt id. Commodi consequatur atque debitis possimus et qui dolore animi autem aspernatur hic? Deleniti officiis similique laboriosam fugit. Cumque delectus sint molestias suscipit, in aperiam veniam earum velit et aliquam, est pariatur nemo ex sit, ea quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sit nobis blanditiis sint saepe esse ex, nisi a consectetur amet soluta totam magni quibusdam non architecto aspernatur facilis deserunt incidunt id. Commodi consequatur atque debitis possimus et qui dolore animi autem aspernatur hic? Deleniti officiis similique laboriosam fugit. Cumque delectus sint molestias suscipit, in aperiam veniam earum velit et aliquam, est pariatur nemo ex sit, ea quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sit nobis blanditiis sint saepe esse ex, nisi a consectetur amet soluta totam magni quibusdam non architecto aspernatur facilis deserunt incidunt id. Commodi consequatur atque debitis possimus et qui dolore animi autem aspernatur hic? Deleniti officiis similique laboriosam fugit. Cumque delectus sint molestias suscipit, in aperiam veniam earum velit et aliquam, est pariatur nemo ex sit, ea quos.Commodi consequatur atque debitis possimus et qui dolore animi autem aspernatur hic? Deleniti officiis similique laboriosam fugit. Cumque delectus sint molestias suscipit, in aperiam veniam earum velit et aliquam, est pariatur nemo ex sit, ea quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sit nobis blanditiis sint saepe esse ex, nisi a consectetur amet soluta totam magni quibusdam non architecto aspernatur facilis deserunt incidunt id. Commodi consequatur atque debitis possimus et qui dolore animi autem aspernatur hic? Deleniti officiis similique laboriosam fugit. Cumque delectus sint molestias suscipit, in aperiam veniam earum velit et aliquam, est pariatur nemo ex sit, ea quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sit nobis blanditiis sint saepe esse ex, nisi a consectetur amet soluta totam magni quibusdam non architecto aspernatur facilis deserunt incidunt id. Commodi consequatur atque debitis possimus et qui dolore animi autem aspernatur hic? Deleniti officiis similique laboriosam fugit. Cumque delectus sint molestias suscipit, in aperiam veniam earum velit et aliquam, est pariatur nemo ex sit, ea quos."
              readOnly
              style={{
                scrollbarColor: "gray black",
                WebkitScrollbar: {
                  width:"10px",
                  backgroundColor: "black",
                },
                scrollbarWidth: "thin"
              }}
            />
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
