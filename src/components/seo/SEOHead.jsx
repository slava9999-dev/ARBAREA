/**
 * SEOHead Component
 * Dynamic meta tags + Schema.org structured data
 */

import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  product = null,
}) => {
  const siteUrl = 'https://arbarea.ru';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image?.startsWith('http') ? image : `${siteUrl}${image}`;

  const defaultTitle = 'Arbarea — Премиальный декор из дуба ручной работы';
  const defaultDescription =
    'Авторские изделия из массива дуба: вешалки, полки, столы. Уникальный дизайн, натуральные материалы. Доставка по России.';
  const defaultImage = `${siteUrl}/og-image.jpg`;

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image ? fullImage : defaultImage;

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images?.map((img) => `${siteUrl}${img}`) || [finalImage],
        description: product.description || finalDescription,
        brand: {
          '@type': 'Brand',
          name: 'Arbarea',
        },
        offers: {
          '@type': 'Offer',
          url: fullUrl,
          priceCurrency: 'RUB',
          price: product.price,
          availability:
            product.inStock !== false
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Arbarea',
          },
        },
      }
    : null;

  const organizationSchema = !product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Arbarea',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: defaultDescription,
        sameAs: ['https://t.me/Arbarea_life', 'https://vk.com/arbarea_nn'],
      }
    : null;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Arbarea" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      <link rel="canonical" href={fullUrl} />

      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {organizationSchema && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}
    </Helmet>
  );
};

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    inStock: PropTypes.bool,
  }),
};

export default SEOHead;
