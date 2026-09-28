import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="bg-[#1C1917] text-[#FAF7F2] text-xs py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md"
    >
      <WifiOff className="w-4 h-4 text-[#FDE68A]" aria-hidden="true" />
      <span>Modo sin conexión. Verifique su red a internet para sincronizar datos.</span>
    </div>
  );
};
