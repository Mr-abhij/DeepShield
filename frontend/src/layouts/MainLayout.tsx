import { Outlet } from 'react-router-dom';


// Used only for the Landing page — no padding, full bleed
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0A10]">
      <Outlet />
    </div>
  );
}
