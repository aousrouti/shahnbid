import { redirect } from 'next/navigation';

// /client → /client/dashboard
export default function ClientRoot() {
  redirect('/client/dashboard');
}
