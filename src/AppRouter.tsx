import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import Forum from "./pages/Forum";
import Members from "./pages/Members";
import PoliticianMonitor from "./pages/PoliticianMonitor";
import Resources from "./pages/Resources";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  const basename = '';

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/members" element={<Members />} />
        <Route path="/politician-monitor" element={<PoliticianMonitor />} />
        <Route path="/resources" element={<Resources />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;