import { Navigate, Route, Routes } from "react-router-dom";
import MapPage from "../pages/MapPage/MapPage";
import ViewerPage from "../pages/ViewerPage/ViewerPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/scan/:scanId" element={<ViewerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
