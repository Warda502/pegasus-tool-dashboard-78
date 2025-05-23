import { DistributorsTable } from '@/components/admin/DistributorsTable';

export default function DistributorsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الموزعين</h1>
      <DistributorsTable />
    </div>
  );
}
