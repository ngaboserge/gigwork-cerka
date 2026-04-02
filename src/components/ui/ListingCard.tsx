import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  image?: string;
  title: string;
  location?: string;
  price: string | ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  metadata?: ReactNode;
  linkTo?: string;
  onClick?: () => void;
}

export function ListingCard({
  image,
  title,
  location,
  price,
  action,
  badge,
  metadata,
  linkTo,
  onClick,
}: ListingCardProps) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
      {image && (
        <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {badge}
        </div>
        
        {location && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
        )}
        
        {metadata && <div className="text-sm text-gray-500">{metadata}</div>}
        
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="text-lg font-bold text-blue-600">{price}</div>
          {action}
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}
