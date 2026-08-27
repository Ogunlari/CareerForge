import { Outlet } from 'react-router-dom';
import Navbar from '@/component/navbar/Navbar'; // Adjust path if needed
import Footer from '@/component/footer/Footer'; // Adjust path if needed

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* Home.tsx renders here */}
      </main>
      <Footer />
    </div>
  );
}