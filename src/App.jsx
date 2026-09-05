import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CaseIntake from "./pages/CaseIntake";
import CaseAnalysis from "./pages/CaseAnalysis";
import CaseSummary from "./pages/CaseSummary";
import AskClaimReady from "./pages/AskClaimReady";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case-intake" element={<CaseIntake />} />
      <Route path="/case-analysis" element={<CaseAnalysis />} />
      <Route path="/case-summary" element={<CaseSummary />} />
      <Route path="/ask" element={<AskClaimReady />}
/>
    </Routes>
  );
}

export default App;