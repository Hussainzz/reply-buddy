import React from "react";
import ReactDOM from "react-dom";
import "./popup.css";
import { Box } from "@mui/material";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "../components/ProtectedRoutes";
import DashboardMain from "../components/Dashboard/DashboardMain";
import Login from "../components/Login";
import { RecoilRoot } from "recoil";

const App: React.FC<{}> = () => {
  return (
    <RecoilRoot>
      <Box mx="8px" my="16px">
        <Router>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<DashboardMain />} />
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </Box>
    </RecoilRoot>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
