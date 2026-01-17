import React, { useEffect } from 'react';

export default function SEOHead({ 
  title = 'FlashFusion',
  description = 'Automated AI-driven discovery & intelligent lifecycle management for passive income success',
  image = 'https://via.placeholder.com/1200x630',
  url = 'https://flashfusion.app',
  type = 'website'
}) {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Meta descriptions
    setMeta('description', description);
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:url', url);
    setMeta('og:type', type);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setMeta('twitter:card', 'summary_large_image');
    
    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
    
  }, [title, description, image, url, type]);

  return null;
}

function setMeta(name, content) {
  let meta = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}