import { Clock, Calendar, Tag, Percent, DollarSign } from 'lucide-react';
import type { Offer } from '@api/offer.api';

interface OfferCardProps {
  offer: Offer;
}

export const OfferCard = ({ offer }: OfferCardProps) => {
  const formatDiscount = () => {
    if (offer.discountPercent) return `${offer.discountPercent}% OFF`;
    if (offer.discountAmount) return `$${Number(offer.discountAmount).toLocaleString()} OFF`;
    return 'Promoción especial';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-[#C9A84C]/30 transition-all group">
      {/* Imagen */}
      <div className="h-48 bg-[#252525] relative overflow-hidden">
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={48} className="text-[#3A3A3A]" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
            offer.type === 'PERMANENT'
              ? 'bg-blue-500/20 text-blue-400 backdrop-blur-sm'
              : 'bg-orange-500/20 text-orange-400 backdrop-blur-sm'
          }`}>
            {offer.type === 'PERMANENT' ? <Clock size={12} /> : <Calendar size={12} />}
            {offer.type === 'PERMANENT' ? 'Permanente' : 'Tiempo limitado'}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-white font-bold text-lg group-hover:text-[#C9A84C] transition-colors">
            {offer.title}
          </h3>
          <p className="text-[#9CA3AF] text-sm mt-1 line-clamp-2">
            {offer.description || 'Aprovecha esta promoción exclusiva'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {offer.discountPercent ? (
            <Percent size={16} className="text-[#C9A84C]" />
          ) : (
            <DollarSign size={16} className="text-[#C9A84C]" />
          )}
          <span className="text-[#C9A84C] font-bold text-xl">{formatDiscount()}</span>
        </div>

        {offer.type === 'LIMITED_TIME' && offer.validUntil && (
          <p className="text-orange-400/80 text-xs flex items-center gap-1">
            <Calendar size={12} />
            Válida hasta {formatDate(offer.validUntil)}
          </p>
        )}
      </div>
    </div>
  );
};