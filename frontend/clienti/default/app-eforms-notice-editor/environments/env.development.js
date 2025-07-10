(function (window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["production"] = false;
  window["env"]["ENV"] = "DEVELOPMENT";
  window["env"]["BACKEND_URL"] = "http://localhost:8181/rest/m-eforms-ms/v1/public";
})(this);