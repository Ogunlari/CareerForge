import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import Jobs from '@/pages/public/Jobs';
import Home from '@/pages/public/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap pages inside PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          {/* Add other public routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App