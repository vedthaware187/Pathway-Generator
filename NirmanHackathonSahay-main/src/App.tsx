import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Community from "./pages/community";
import NotFound from "./pages/NotFound";
import EventManagement from "./pages/eventmanagement";
import Profile from "./pages/profile";
import Research from "./pages/research";;
import AlumniConnect from "./pages/alumniconnect";
import JobMatching from "./pages/jobmatching";
import Accommodation  from "./pages/accomodation";
import SignupPage from "./pages/signnnup";
import Testmonial from "./pages/Testimonials";
import LoginPage from "./pages/loginpage";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/eventmanagement" element={<EventManagement />} />
          <Route path="/research" element={<Research />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/alumniconnect" element={<AlumniConnect />} />
          <Route path="/accomodation" element={<Accommodation />} />
          <Route path="/jobmatching" element={<JobMatching />} />
          <Route path="/signnnup" element={<SignupPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/Testimonials" element={<Testmonial/>} />
          <Route path="/loginpage" element={<LoginPage/>} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
