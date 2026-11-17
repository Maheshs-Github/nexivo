import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { PageLoader } from "@/components/ui/page-loader";
// The layout ships with the entry chunk (it is on every public page); each route below stays lazy.
import PublicLayout from "@/components/layout/PublicLayout";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Careers = lazy(() => import("@/pages/Careers"));
const JobDetail = lazy(() => import("@/pages/JobDetail"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// The whole admin (TipTap, Recharts, dnd-kit) is one separate tree that public visitors never download.
const AdminApp = lazy(() => import("@/admin/AdminApp"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="work/:slug" element={<ProjectDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="careers" element={<Careers />} />
          <Route path="careers/:slug" element={<JobDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
