interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
}

export function Avatar({ src, name, size = 'md', className = '', showStatus = false, status = 'offline' }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-neutral-400',
    busy: 'bg-amber-500',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  // Add cache-busting parameter to image URL
  // Extract timestamp from filename (avatar-[timestamp].jpg) to use as cache buster
  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    
    // If URL already has a query parameter, don't add another
    if (url.includes('?')) return url;
    
    // Extract timestamp from URL if it exists (from our upload format: avatar-[timestamp].jpg)
    const timestampMatch = url.match(/avatar-(\d+)\./);
    if (timestampMatch) {
      // Use the timestamp from the filename as cache buster
      return `${url}?v=${timestampMatch[1]}`;
    }
    
    // For old format (avatar.jpg), use a hash of the URL as version
    const hash = url.split('/').pop()?.replace(/\./g, '') || 'v1';
    return `${url}?v=${hash}`;
  };

  const imageUrl = getImageUrl(src);

  return (
    <div className={`relative inline-flex ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover`}
          key={imageUrl} // Force re-render when URL changes
        />
      ) : (
        <div className={`${sizes[size]} bg-primary-100 text-primary-800 font-medium rounded-full flex items-center justify-center`}>
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full ring-2 ring-white`}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: { src?: string; name: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapSizes = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div className="flex items-center">
      {visible.map((avatar, i) => (
        <div key={i} className={i > 0 ? overlapSizes[size] : ''}>
          <Avatar {...avatar} size={size} className="ring-2 ring-white" />
        </div>
      ))}
      {remaining > 0 && (
        <div className={overlapSizes[size]}>
          <div className={`${size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'} bg-neutral-200 text-neutral-600 font-medium rounded-full flex items-center justify-center ring-2 ring-white`}>
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}
