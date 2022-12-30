/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          1: "#005D9E",
          2: "#006BB8",
          3: "#0083E0",
        },
        secondary: {
          1: "#EE4B6A",
          2: "#F16A83",
          3: "#FDECEF",
          4: "#D6445F",
        },
        text: {
          1: "#252733",
          2: "#474A60",
          3: "#9FA2B4",
        },
        greenVx: "#16C784",
        redVx: "#EA3943",
        contentVx: "#F7F8FF",
        separator: "#DFE0EB",
        selection: "#FBFCFF",
        card: "#f9fafb",
      },
      fontFamily: {
        header: ["Poppins", "sans-serif"],
        paragraph: ["Mulish", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
