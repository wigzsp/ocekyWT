import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AdminLayout } from './components/layout/AdminLayout'
import { SiteLayout } from './components/layout/SiteLayout'
import { LoadingCard } from './components/ui/States'
import { useAuth } from './contexts/AuthContext'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminProductCreate from './pages/AdminProductCreate'
import AdminProductEdit from './pages/AdminProductEdit'
import AdminProducts from './pages/AdminProducts'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Product from './pages/Product'

function PublicPage({ children }: { children: ReactNode }) { return <SiteLayout>{children}</SiteLayout> }
function AdminGuard({ children }: { children: ReactNode }) { const { ready, user, isAdmin } = useAuth(); const location = useLocation(); if (!ready) return <div className="grid min-h-screen place-items-center bg-ink"><LoadingCard className="h-10 w-48" /></div>; if (!user || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />; return <AdminLayout>{children}</AdminLayout> }

export default function App() {
  return <Routes>
    <Route path="/" element={<PublicPage><Home /></PublicPage>} />
    <Route path="/catalog" element={<PublicPage><Catalog /></PublicPage>} />
    <Route path="/product/:id" element={<PublicPage><Product /></PublicPage>} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
    <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
    <Route path="/admin/products/new" element={<AdminGuard><AdminProductCreate /></AdminGuard>} />
    <Route path="/admin/products/:id/edit" element={<AdminGuard><AdminProductEdit /></AdminGuard>} />
    <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
    <Route path="/404" element={<PublicPage><NotFound /></PublicPage>} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
}
