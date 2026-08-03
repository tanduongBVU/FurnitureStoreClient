import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => (
  <>
    <Navbar />
    <main style={{ paddingTop: "72px" }}>
      <Outlet />
    </main>
  </>
);

export default MainLayout;