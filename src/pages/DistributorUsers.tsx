import { DistributorUsersTable } from '@/components/distributor/DistributorUsersTable';

export default function DistributorUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
      <DistributorUsersTable />
    </div>
  );
}
