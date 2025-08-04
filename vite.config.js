import glsl from "vite-plugin-glsl";

export default {
  server: {
    base: '/WebGL-galaxy-generator/',
    host: true,
  },
  plugins: [glsl()],
};
