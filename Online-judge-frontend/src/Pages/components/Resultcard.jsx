const Resultcard = ({fieldValue, fieldName}) => {
    return ( 
        <>
        <div className="h-[100vh] w-[30vw] R-container flex justify-center items-center">
        <div className="h-[28vh] w-[16vw]  rounded-3xl justify-center items-center flex flex-col border-solid border-[1px] border-lime-400 ">
            <div className="h-[16vh] w-[15.8vw] bg-[#86C232] rounded-t-3xl flex justify-center items-center text-[25px] font-bold">{fieldValue}</div>
            <div className="h-[14vh] w-[15.8vw] bg-transparent rounded-b-3xl flex justify-center items-center text-[22px] font-bold text-white">{fieldName}</div>
        </div>
        </div>
        </>
     );
}
 
export default Resultcard;