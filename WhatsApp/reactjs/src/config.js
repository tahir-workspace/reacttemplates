// src/config.js
const isLocalhost = window.location.hostname === "localhost";

const config = {
  server: {
    host: isLocalhost ? "localhost" : "tahir-workspace-wu-express.vercel.app",
    port: 5001,
  },

  peerjs: {
    host: isLocalhost ? "localhost" : "tahir-workspace-wu-express.vercel.app",
    port: 5001,
    path: "/peerjs/myapp",
  },

  get serverBaseUrl() {
    const protocol = isLocalhost ? "http" : "https";
    return `${protocol}://${this.server.host}:${this.server.port}`;
  },

  get peerJsOptions() {
    return {
      host: this.peerjs.host,
      port: this.peerjs.port,
      path: this.peerjs.path,
      secure: !isLocalhost,
    };
  },
};

export default config;
