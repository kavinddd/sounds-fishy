import { BrowserRouter, Route, Routes } from "react-router";
import AppPage from "./features/app/AppPage";
import AppLayout from "./features/app/AppLayout";
import HomePage from "./HomePage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<AppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
