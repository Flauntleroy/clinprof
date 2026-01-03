import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard
import DashboardHome from "./pages/Dashboard/DashboardHome";

// Dokter
import { DokterList, DokterForm } from "./pages/Dokter";

// Booking
import { BookingList } from "./pages/Booking";
import Calendar from "./pages/Calendar";

// Layanan
import { LayananList, LayananForm } from "./pages/Layanan";

// Fasilitas
import { FasilitasList, FasilitasForm } from "./pages/Fasilitas";

// Jadwal
import { JadwalDokter } from "./pages/Jadwal";

// Pengaturan
import { PengaturanUmum, PengaturanWhatsApp } from "./pages/Pengaturan";

// Konten Website
import { KontenHero, KontenTentang, KontenKontak } from "./pages/Konten";

// Berita
import { BeritaList, BeritaForm, KategoriBerita } from "./pages/Berita";

// Others
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";

// Auth
import SignIn from "./pages/AuthPages/SignIn";



export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Protected Dashboard Layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              {/* Dashboard Home */}
              <Route index path="/" element={<DashboardHome />} />

              {/* Booking */}
              <Route path="/booking" element={<BookingList />} />
              <Route path="/booking/calendar" element={<Calendar />} />

              {/* Dokter */}
              <Route path="/dokter" element={<DokterList />} />
              <Route path="/dokter/tambah" element={<DokterForm />} />
              <Route path="/dokter/edit/:id" element={<DokterForm isEdit />} />
              <Route path="/dokter/jadwal" element={<JadwalDokter />} />

              {/* Layanan */}
              <Route path="/layanan" element={<LayananList />} />
              <Route path="/layanan/tambah" element={<LayananForm />} />
              <Route path="/layanan/edit/:id" element={<LayananForm isEdit />} />

              {/* Fasilitas */}
              <Route path="/fasilitas" element={<FasilitasList />} />
              <Route path="/fasilitas/tambah" element={<FasilitasForm />} />
              <Route path="/fasilitas/edit/:id" element={<FasilitasForm isEdit />} />

              {/* Konten Website */}
              <Route path="/konten/hero" element={<KontenHero />} />
              <Route path="/konten/tentang" element={<KontenTentang />} />
              <Route path="/konten/kontak" element={<KontenKontak />} />

              {/* Berita */}
              <Route path="/berita" element={<BeritaList />} />
              <Route path="/berita/tambah" element={<BeritaForm />} />
              <Route path="/berita/edit/:id" element={<BeritaForm isEdit />} />
              <Route path="/berita/kategori" element={<KategoriBerita />} />

              {/* Pengaturan */}
              <Route path="/pengaturan" element={<PengaturanUmum />} />
              <Route path="/pengaturan/whatsapp" element={<PengaturanWhatsApp />} />

              {/* Others */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/blank" element={<Blank />} />
            </Route>

            {/* Auth - Redirect to main app login */}
            <Route path="/signin" element={<SignIn />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
