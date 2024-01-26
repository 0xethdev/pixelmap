/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  mode: 'jit',
  theme: {
    extend: {
      colors: {
        black: "#0F0F0F",
        white: "#FFFFFF",
        lightgrey: "#EBEBEB",
        darkgrey: "#3D3D3D",
        offblack: "#303030"
      },
      fontFamily: {
        array: ["Array"],
        connection:["Connection"],
      },
      container: {
        center: true,
        padding: "0px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
      }
    },
    
  },
  plugins: [],
}

{/**

screens: {
      xs: "480px",
      sm: "768px",
      md: "1060px"
    }

*/}