import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div>
      <Toaster position="top-right" />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
