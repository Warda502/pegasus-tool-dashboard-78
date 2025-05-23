import { DistributorCreditsTable } from '@/components/distributor/DistributorCreditsTable';

export default function DistributorCreditsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الرصيد والعمولات</h1>
      <DistributorCreditsTable />
    </div>
  );
}
