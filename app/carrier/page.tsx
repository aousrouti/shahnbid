import { redirect } from 'next/navigation';

// /carrier → /carrier/dashboard
export default function CarrierRoot() {
  redirect('/carrier/dashboard');
}
