import { useOffers } from '@hooks/useOffers';
import { OfferCard } from './OfferCard';
import { Tag, Loader } from 'lucide-react';

export const OfferList = () => {
  const { offers, loading, error, refresh } = useOffers({ mode: 'public', autoFetch: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 px-4 py-2 bg-[#252525] text-white text-sm rounded-lg hover:bg-[#3A3A3A] transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-[#1E1E1E] rounded-xl p-8 border border-[#2A2A2A] text-center">
        <Tag size={32} className="text-[#3A3A3A] mx-auto mb-3" />
        <p className="text-[#9CA3AF] text-sm">No hay ofertas disponibles en este momento</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
};