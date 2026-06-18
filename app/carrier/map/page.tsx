import PageHeader from '@/components/shared/PageHeader';
import CarrierMapPanel from '@/components/carrier/CarrierMapPanel';
import { mockCarrierTrip } from '@/lib/mock-data/carrier-trip';

export default function CarrierMapPage() {
  const trip = mockCarrierTrip;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte & opportunités"
        subtitle={`Trajet en cours : ${trip.fromCity} → ${trip.toCity} · ${trip.vehicleType}`}
      />
      <CarrierMapPanel variant="full" />
    </div>
  );
}
