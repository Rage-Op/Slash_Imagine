import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Login } from "./pages/Login";
import { Test } from "./pages/Test";
import Home from "./pages/Home";
import { SettingsPage } from "./pages/Settings";
import { profileLayout } from "./components/settingsComponents/profileLayout";
import { accountLayout } from "./components/settingsComponents/accountLayout";
import { appearanceLayout } from "./components/settingsComponents/appearanceLayout";
import { notificationsLayout } from "./components/settingsComponents/notificationsLayout";
import { displayLayout } from "./components/settingsComponents/displayLayout";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<Test />} />
          <Route path="/Home" element={<Home />} />
          <Route
            path="/Settings/Profile"
            element={<SettingsPage children={profileLayout()} />}
          />
          <Route
            path="/Settings/account"
            element={<SettingsPage children={accountLayout()} />}
          />
          <Route
            path="/Settings/appearance"
            element={<SettingsPage children={appearanceLayout()} />}
          />
          <Route
            path="/Settings/notifications"
            element={<SettingsPage children={notificationsLayout()} />}
          />
          <Route
            path="/Settings/display"
            element={<SettingsPage children={displayLayout()} />}
          />
          {/* <Route path="/Settings/Account" element={<SettingsLayout children={} />} />
          <Route path="/Settings/Appearance" element={<SettingsLayout children={} />} />
          <Route path="/Settings/Notifications" element={<SettingsLayout children={} />} />
          <Route path="/Settings/Display" element={<SettingsLayout children={} />} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
