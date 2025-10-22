// src/config.js
const isLocalhost = window.location.hostname === "localhost";

const config = {
  server: {
    host: isLocalhost ? "localhost" : "reacttemplates.onrender.com",
    port: isLocalhost ? 5001 : 443,
  },

  peerjs: {
    host: isLocalhost ? "localhost" : "reacttemplates.onrender.com",
    port: isLocalhost ? 5001 : 443,
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
