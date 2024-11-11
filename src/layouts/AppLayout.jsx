import { Outlet } from 'react-router-dom';
import Header from "@/features/webApp/components/header";

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
