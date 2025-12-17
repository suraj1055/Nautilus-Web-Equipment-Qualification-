import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import App from "./components/app";
import { Provider } from "react-redux";
import store from "./store";
import { registerLicense } from "@syncfusion/ej2-base";

import EquipmentDashboard from "./components/EquipmentQualification/EquipmentDashboard";

// Import Stimulsoft for license registration
import { Stimulsoft } from "stimulsoft-reports-js/Scripts/stimulsoft.reports";

// Registering Syncfusion license key
registerLicense(
  "ORg4AjUWIQA/Gnt2UVhhQlVFfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTX5Qdk1jXX5Zc3xUTmRf"
);

// Registering Stimulsoft license key
if (typeof Stimulsoft !== 'undefined' && Stimulsoft.Base && Stimulsoft.Base.StiLicense) {
  Stimulsoft.Base.StiLicense.key =
    "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkkkM7//UzWsFVogMty1qWIYwyioHFWOcT0IXfVnOpj6vV1sN" +
    "ZIIXpnI52dKJ0XqyO9t+PSzKaQY5vDG+2tp7BKLBTP7RdTNAxZdVIqKy20Sp49FepLVP+ZpGTMWMiiCT9zlZuzUGm8" +
    "xOjx1ywgOpbzvcHDBm329QzIR2hk2fUz2fSVbVKJIZBkfPUzKXPIU/hPLFtmFIsgR9jxAgRZx0Ai538LEc67paOL2Z" +
    "fKNzlGpdrEopVGCmo66x3dPcFRT0m1JtndmkFFDOL9O3BkDP194kIr5GuLGCUQzILb0R+s0zXMVRLQI/bjPJoH0+Xe" +
    "q0vT51hvOoIGj9Ta15/QgRUO6VGQGmB4vJ90mmdbTTAYQ7KKkBEk2R3D4N5odj6SWN1sJyi9PH3zniWxw/Mfa8Qqsq" +
    "+JKVKtteeZOGRTWS27haEYKbVoMvjythP567DinMEXPbrVCCnDNHJ7MmyFQjItP8qbz3kvWfhYGyPuMfKwLjvPNMBp" +
    "Y8M3C1O4+FHAmx5FmwyJE6u/xMSbdBp8bPKp";
}

const Root = () => {
  return (
    <div className="App">
      <Provider store={store}>
        <BrowserRouter basename={`/`}>
          <Switch>
            {/* Redirect root to dashboard */}
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>

            {/* Main app with Equipment Dashboard */}
            <App>
              <Route
                path="/dashboard"
                component={EquipmentDashboard}
              />
            </App>
          </Switch>
        </BrowserRouter>
      </Provider>
    </div>
  );
};

export default Root;

ReactDOM.render(<Root />, document.getElementById("root"));
