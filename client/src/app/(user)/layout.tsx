import { PatientSidebar } from '@/components/layouts/PatientSidebar';
import { PatientTopBar }   from '@/components/layouts/PatientTopBar';
import AuthGuard from '@/components/shared/AuthGuard';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['Patient', 'Donor']}>
      <div className="flex h-screen bg-[#F5F2E8] overflow-hidden">
        <PatientSidebar />
        <div className="flex flex-col flex-1 ml-[240px] min-w-0 overflow-hidden">
          <PatientTopBar />
          <main className="flex-1 overflow-y-auto p-7">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
