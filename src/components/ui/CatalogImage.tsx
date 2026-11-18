import { useEffect, useState, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { SkeletonImage } from './Skeleton';
import { extractCatalogMediaId } from '../../utils/imageOptimizer';
import { fetchCatalogMediaById } from '../../services/merakiFirestore';

export interface CatalogImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  variant?: 'default' | 'warm' | 'dark';
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  children?: ReactNode;
}

export function CatalogImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  variant = 'default',
  fetchPriority = 'auto',
  loading = 'lazy',
  width,
  height,
  children,
}: CatalogImageProps) {
  const cleanSrc = (src || '').trim();
  const mediaId = extractCatalogMediaId(cleanSrc);

  const [resolvedUrl, setResolvedUrl] = useState<string>(() => (mediaId ? '' : cleanSrc));
  const [resolvingMedia, setResolvingMedia] = useState<boolean>(Boolean(mediaId));
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    setHasFailed(false);

    if (!cleanSrc) {
      setResolvedUrl('');
      setResolvingMedia(false);

      return;
    }

    if (!mediaId) {
      setResolvedUrl(cleanSrc);
      setResolvingMedia(false);

      return;
    }

    let cancelled = false;

    setResolvingMedia(true);

    void fetchCatalogMediaById(mediaId).then((dataUrl) => {
      if (cancelled) return;

      if (dataUrl) {
        setResolvedUrl(dataUrl);
      } else {
        setResolvedUrl('');
        setHasFailed(true);
      }

      setResolvingMedia(false);
    });

    return () => {
      cancelled = true;
    };
  }, [cleanSrc, mediaId]);

  if (resolvingMedia) {
    return (
      <div className={`relative overflow-hidden meraki-skeleton ${containerClassName}`}>
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <progress aria-label={`Cargando ${alt}`} className="loading-spinner" />
        </div>
        {children}
      </div>
    );
  }

  if (!resolvedUrl || hasFailed) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#EDF2EC] via-[#FFF2DE]/70 to-[#D5A688]/20 flex flex-col items-center justify-center text-center p-4 ${containerClassName}`}
      >
        <Sparkles className="w-7 h-7 text-[#5E765E]/45 mb-2" />
        <span className="text-[11px] font-medium text-[#5E765E]/75 line-clamp-2 max-w-[180px]">
          {alt}
        </span>
        {children}
      </div>
    );
  }

  return (
    <SkeletonImage
      src={resolvedUrl}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      variant={variant}
      containerClassName={containerClassName}
      className={className}
    >
      {children}
    </SkeletonImage>
  );
}
