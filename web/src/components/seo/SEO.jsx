import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for managing page metadata.
 * Uses react-helmet-async to update the head tags dynamically.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (will be suffixed with brand name)
 * @param {string} props.description - Meta description for search results
 * @param {string} [props.image] - OpenGraph image URL
 * @param {string} [props.url] - Canonical URL for the page
 * @returns {JSX.Element}
 */
const SEO = ({ title, description, image, url }) => {
  const brandName = "La Vin Nails";
  const defaultDescription = "Reserva tu cita de manicura en La Vin Nails, Granada. Servicio profesional y personalizado para el cuidado de tus uñas.";
  const defaultImage = "https://res.cloudinary.com/duoshgr3h/image/upload/v1723893977/PortadaSeptiembre24S_lqo1pp.webp";

  const fullTitle = title ? `${title} | ${brandName}` : brandName;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />
    </Helmet>
  );
};

export default SEO;
