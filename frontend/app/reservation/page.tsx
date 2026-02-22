import { Suspense } from "react";
import ReservationClient from "./ReservationClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Učitavanje...</div>}>
      <ReservationClient />
    </Suspense>
  );
}