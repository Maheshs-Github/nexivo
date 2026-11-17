import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageLoader } from "@/components/ui/page-loader";
import { AuthProvider, RequireAuth } from "./lib/auth";
import AdminLayout from "./layout/AdminLayout";
import { RESOURCES } from "./resources";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));
const Sections = lazy(() => import("./pages/Sections"));
const ResourcePage = lazy(() => import("./pages/ResourcePage"));
const Applications = lazy(() => import("./pages/Applications"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));
const SeoPage = lazy(() => import("./pages/SeoPage"));
const MediaLibrary = lazy(() => import("./pages/MediaLibrary"));
const Users = lazy(() => import("./pages/Users"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminNotFound = lazy(() => import("./pages/AdminNotFound"));

export default function AdminApp() {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <Helmet><meta name="robots" content="noindex,nofollow" /><title>Admin</title></Helmet>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="blogs" element={<BlogList />} />
              <Route path="blogs/new" element={<BlogEditor />} />
              <Route path="blogs/:id" element={<BlogEditor />} />
              <Route path="pages" element={<Sections />} />
              {Object.values(RESOURCES).map((r) => <Route key={r.path} path={r.path} element={<ResourcePage config={r} />} />)}
              <Route path="applications" element={<Applications />} />
              <Route path="messages" element={<Messages />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="seo" element={<SeoPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </TooltipProvider>
    </AuthProvider>
  );
}
