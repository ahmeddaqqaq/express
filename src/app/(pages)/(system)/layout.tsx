import MainLayout from "../../components/main-layout";
import "../../globals.css";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
