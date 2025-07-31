"use client"; // Menandakan bahwa ini adalah Client Component

import { useEffect } from 'react';

// Props dari komponen ini adalah songId
type ViewCounterProps = {
  songId: string;
};

export default function ViewCounter({ songId }: ViewCounterProps) {
  useEffect(() => {
    // Fungsi untuk mengirim request POST
    const recordView = async () => {
      try {
        await fetch(`/api/songs/${songId}/view`, {
          method: 'POST',
        });
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    };

    recordView();
    // Array dependensi kosong [] berarti useEffect ini hanya berjalan satu kali
    // yaitu saat komponen pertama kali di-mount (ditampilkan).
  }, [songId]);

  // Komponen ini tidak merender apa-apa ke layar.
  // Tujuannya murni untuk memicu efek samping (API call).
  return null;
}
