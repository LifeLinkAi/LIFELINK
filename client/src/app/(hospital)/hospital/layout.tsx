import { HospitalSidebar } from '@/components/layouts/HospitalSidebar';
import { HospitalTopBar }   from '@/components/layouts/HospitalTopBar';

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <HospitalSidebar />
      <div className="flex flex-col flex-1 ml-[240px] min-w-0 overflow-hidden">
        <HospitalTopBar />
        <main className="flex-1 overflow-y-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
