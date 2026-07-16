import Sidebar from "../../components/Sidebar/Sidebar";
import "./MainLayout.css";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        {children}
      </main>
    </div>
  );
}