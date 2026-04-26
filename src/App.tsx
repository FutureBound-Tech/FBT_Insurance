import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Landing from '@/pages/Landing'
import Assessment from '@/pages/Assessment'
import Recommendations from '@/pages/Recommendations'
import Calculator from '@/pages/Calculator'
import Compare from '@/pages/Compare'
import ThankYou from '@/pages/ThankYou'
import UserDashboard from '@/pages/UserDashboard'

import Login from '@/pages/admin/Login'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import AdminLayout from '@/pages/admin/Layout'
import Dashboard from '@/pages/admin/Dashboard'
import Leads from '@/pages/admin/Leads'
import LeadDetail from '@/pages/admin/LeadDetail'
import Policies from '@/pages/admin/Policies'
import FollowUps from '@/pages/admin/FollowUps'
import Settings from '@/pages/admin/Settings'

import { Header, Footer } from '@/components/layout'
import AiChatWidget from '@/components/shared/AiChatWidget'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
})

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiChatWidget />
    </div>
  )
}

function UserSessionRoute({ children }: { children: React.ReactNode }) {
  const hasSession = typeof window !== "undefined" && localStorage.getItem("assessment_profile");
  if (!hasSession) return <Navigate to="/assessment" replace />;
  return <PublicLayout>{children}</PublicLayout>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
          <Route path="/assessment" element={<PublicLayout><Assessment /></PublicLayout>} />
          <Route path="/recommendations" element={<PublicLayout><Recommendations /></PublicLayout>} />
          <Route path="/calculator" element={<PublicLayout><Calculator /></PublicLayout>} />
          <Route path="/compare" element={<PublicLayout><Compare /></PublicLayout>} />
          <Route path="/thank-you" element={<PublicLayout><ThankYou /></PublicLayout>} />

          {/* User Dashboard (session-based) */}
          <Route path="/dashboard" element={<UserSessionRoute><UserDashboard /></UserSessionRoute>} />

          {/* Agent Login */}
          <Route path="/agent-login" element={<Login />} />

          {/* Protected Agent Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/agent-dashboard" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:id" element={<LeadDetail />} />
              <Route path="policies" element={<Policies />} />
              <Route path="follow-ups" element={<FollowUps />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
