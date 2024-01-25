import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { setAssetPath } from "@esri/calcite-components/dist/components";

import "@esri/calcite-components/dist/components/calcite-input";
import "@esri/calcite-components/dist/components/calcite-input-message";

import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-block";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-stepper";
import "@esri/calcite-components/dist/components/calcite-stepper-item";
import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-select";
import "@esri/calcite-components/dist/components/calcite-option";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-scrim";
import "@esri/calcite-components/dist/components/calcite-notice";
import "@esri/calcite-components/dist/components/calcite-modal";
import "@esri/calcite-components/dist/components/calcite-link";
import "@esri/calcite-components/dist/components/calcite-popover";
import "@esri/calcite-components/dist/components/calcite-icon";
import "@esri/calcite-components/dist/components/calcite-tabs";
import "@esri/calcite-components/dist/components/calcite-tab-nav";
import "@esri/calcite-components/dist/components/calcite-tab-title";
import "@esri/calcite-components/dist/components/calcite-tab";
import "@esri/calcite-components/dist/components/calcite-fab";
import "@esri/calcite-components/dist/components/calcite-alert";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-item";
import "@esri/calcite-components/dist/components/calcite-list-item-group";
import "@esri/calcite-components/dist/components/calcite-text-area";
import "@esri/calcite-components/dist/components/calcite-accordion";
import "@esri/calcite-components/dist/components/calcite-accordion-item";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-navigation-user";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-chip";
import "@esri/calcite-components/dist/components/calcite-action";

setAssetPath(window.location.href);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
