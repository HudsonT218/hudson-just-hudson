import { AdminShell } from '@/components/configurator/admin/AdminShell';
import { AdminOrderList } from '@/components/configurator/admin/AdminOrderList';

export default function AdminPage() {
  return (
    <AdminShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve, reject, or jump into any order&apos;s preview.
          </p>
        </div>
        <AdminOrderList />
      </div>
    </AdminShell>
  );
}
