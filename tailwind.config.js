// const config = require("tailwindcss/stubs/defaultConfig.stub");

module.exports = {
  // ...config,
  purge: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media",
  // theme: {
  //   container: {
  //     padding: {
  //       default: "1rem",
  //       sm: "1rem",
  //       lg: "2rem",
  //       xl: "2rem",
  //     },
  //   },
  //   extend: {},
  // },
  // variants: {
  //   boxShadow: ["responsive", "hover", "focus", "focus-within"],
  //   borderWidth: ["responsive", "first", "last", "hover", "focus"],
  //   extend: {},
  // },
  plugins: [],
};
