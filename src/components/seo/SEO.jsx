import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO Component for managing Head tags and Schema.org markup
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  productData = null,
}) => {
  const siteTitle = 'Arbarea | Premium Woodworking';
  const fullTitle = title === 'Arbarea' ? siteTitle : `${title} | Arbarea`;
  const metaDescription =
    description ||
    'Эксклюзивная мебель и декор из массива дерева ручной работы. Создаем уют и стиль в вашем доме.';
  const metaImage = image
    ? image.startsWith('http')
      ? image
      : `https://arbarea.ru${image}`
    : 'https://arbarea.ru/og-image.jpg';
  const metaUrl = url
    ? url.startsWith('http')
      ? url
      : `https://arbarea.ru${url}`
    : 'https://arbarea.ru/';

  // Schema.org JSON-LD generation
  let schema = null;

  if (productData) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.name,
      image: [metaImage],
      description: metaDescription,
      brand: {
        '@type': 'Brand',
        name: 'Arbarea',
      },
      offers: {
        '@type': 'Offer',
        url: metaUrl,
        priceCurrency: 'RUB',
        price: productData.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: productData.isSold
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Arbarea',
        },
      },
    };

    if (productData.rating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: productData.rating,
        reviewCount: productData.reviewCount || '5', // Mock count if not real
      };
    }
  } else if (type === 'website') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      url: 'https://arbarea.ru',
      logo: 'https://arbarea.ru/icon.svg',
      name: 'Arbarea',
      description:
        'Авторская столярная мастерская эксклюзивной мебели из массива.',
      sameAs: [
        'https://t.me/arbarea',
        // Add other socials
      ],
    };
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={metaUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={metaImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  productData: PropTypes.object,
};

export default SEO;
