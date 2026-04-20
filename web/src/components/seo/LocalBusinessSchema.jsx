import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * LocalBusinessSchema Component.
 * Injects JSON-LD structured data to help search engines understand the business.
 */
const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "La Vin Nails",
    "image": [
      "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaSeptiembre24S_lqo1pp.webp",
      "https://res.cloudinary.com/duoshgr3h/image/upload/v1737924764/logo-la-vin-nails-simplificado_hjqkw.webp"
    ],
    "@id": window.location.origin,
    "url": window.location.origin,
    "telephone": "+34699861930",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "C. Periodista Rafael Gago Palomo 7, local 3",
      "addressLocality": "Granada",
      "addressRegion": "Andalucía",
      "postalCode": "18014",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.1990508,
      "longitude": -3.6193694
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "10:00",
        "closes": "20:00"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/nailsgranada.lavin/"
    ],
    "priceRange": "€€"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default LocalBusinessSchema;
