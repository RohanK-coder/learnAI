import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CoursesPage from "./pages/CoursePage";
import MyCoursesPage from "@/pages/MyCoursesPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import MessagesPage from "@/pages/MessagesPage";
import { useAuth } from "@/hooks/useAuth";
import { JSX } from "react";

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/courses" element={<Protected><CoursesPage /></Protected>} />
        <Route path="/courses/:courseId" element={<Protected><CourseDetailPage /></Protected>} />
        <Route path="/my-courses" element={<Protected><MyCoursesPage /></Protected>} />
        <Route path="/messages" element={<Protected><MessagesPage /></Protected>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}