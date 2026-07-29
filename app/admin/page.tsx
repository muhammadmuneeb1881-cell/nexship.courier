import AdminDashboard from "../../components/admin/AdminDashboard";

export const metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
