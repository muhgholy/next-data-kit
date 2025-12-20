const config = {
     plugins: {
          "@tailwindcss/postcss": {
               content: [
                    "./src/**/*.{js,ts,jsx,tsx,mdx}",
                    "../src/**/*.{js,ts,jsx,tsx}",
               ],
          },
     },
};

export default config;
