import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SITE_URL = 'https://arbarea.ru';
const SITE_TITLE = 'Arbarea | Premium Woodworking';
const DEFAULT_DESCRIPTION =
  'Эксклюзивная мебель и декор из массива дерева ручной работы. Создаем уют и стиль в вашем доме.';

const YANDEX_VERIFICATION =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_YANDEX_VERIFICATION
    : undefined;

const absolute = (value, fallback) => {
  if (!value) return fallback;
  return value.startsWith('http') ? value : `${SITE_URL}${value}`;
};

/**
 * Single source of truth for per-page head tags + Schema.org markup.
 * Handles Product / Organization / WebSite (SearchAction) / BreadcrumbList,
 * canonical URLs, robots (noindex), and Yandex domain verification.
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  productData = null,
  breadcrumbs = null,
  noindex = false,
}) => {
  const fullTitle = title === 'Arbarea' ? SITE_TITLE : `${title} | Arbarea`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = absolute(image, `${SITE_URL}/og-image.jpg`);
  const metaUrl = absolute(url, `${SITE_URL}/`);

  const schemas = [];

  if (productData) {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.name,
      image: [metaImage],
      description: metaDescription,
      brand: { '@type': 'Brand', name: 'Arbarea' },
      offers: {
        '@type': 'Offer',
        url: metaUrl,
        priceCurrency: 'RUB',
        price: productData.price,
        priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        itemCondition: 'https://schema.org/NewCondition',
        availability: productData.isSold
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Arbarea' },
      },
    };

    if (productData.rating) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: productData.rating,
        reviewCount: productData.reviewCount || '5',
      };
    }

    schemas.push(productSchema);
  } else if (type === 'website') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      name: 'Arbarea',
      description:
        'Авторская столярная мастерская эксклюзивной мебели и декора из массива дуба и ясеня.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        areaServed: 'RU',
        availableLanguage: 'Russian',
      },
      sameAs: ['https://t.me/Arbarea_life', 'https://vk.com/arbarea_nn'],
    });
  }

  // WebSite + Sitelinks Searchbox on the homepage only.
  if (metaUrl === `${SITE_URL}/`) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: SITE_URL,
      name: 'Arbarea',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absolute(crumb.url, metaUrl),
      })),
    });
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={metaUrl} />
      {YANDEX_VERIFICATION && (
        <meta name="yandex-verification" content={YANDEX_VERIFICATION} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content="Arbarea" />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={metaUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={metaImage} />

      {/* Structured Data (JSON-LD) */}
      {schemas.map((schema) => (
        <script key={schema['@type']} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
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
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string,
    }),
  ),
  noindex: PropTypes.bool,
};

export default SEO;
