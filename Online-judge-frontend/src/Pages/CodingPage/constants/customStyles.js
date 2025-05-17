export const customStyles = {
  control: (styles) => ({
    ...styles,
    width: "100%",
    maxWidth: "14rem",
    minWidth: "12rem",
    borderRadius: "5px",
    color: "#000",
    fontSize: "0.8rem",
    fontWeight: "bold", // Make control text bold
    lineHeight: "1.75rem",
    backgroundColor: "#86C232", // Background color
    cursor: "pointer",
    border: "2px solid #000",
    ":hover": {
      border: "2px solid #86C232",
      boxShadow: "none",
    },
  }),
  option: (styles) => ({
    ...styles,
    color: "#000",
    fontSize: "0.8rem",
    fontWeight: "bold", // Make options text bold
    lineHeight: "1.75rem",
    width: "100%",
    background: "#fff",
    ":hover": {
      backgroundColor: "#fff",
      color: "#000",
      cursor: "pointer",
    },
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#fff",
    maxWidth: "14rem",
    borderRadius: "5px",
  }),
  placeholder: (defaultStyles) => ({
    ...defaultStyles,
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: "bold", // Make placeholder text bold
    lineHeight: "1.75rem",
  }),
  indicator: (styles) => ({
    ...styles,
    color: "#000", // Change the color of the down arrow to black
  }),
};
