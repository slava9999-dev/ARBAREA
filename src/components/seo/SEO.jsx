import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import {
  SHARE_DESCRIPTION,
  SHARE_IMAGE_ALT,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_PATH,
  SHARE_IMAGE_WIDTH,
  SHARE_TITLE,
  SEO_DESCRIPTION,
  SITE_NAME,
  resolveSiteUrl,
} from '../../config/site.js';

const SITE_TITLE = SHARE_TITLE;
const DEFAULT_DESCRIPTION = SEO_DESCRIPTION;

const env =
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const SITE_URL = resolveSiteUrl(env.VITE_SITE_URL);
const YANDEX_VERIFICATION = env.VITE_YANDEX_VERIFICATION;

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
  const fullTitle =
    title === 'Arbarea' ? SITE_TITLE : `${title} | ${SITE_NAME}`;
  const imageAlt = productData?.name || SHARE_IMAGE_ALT;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  // Social previews truncate sooner than search snippets do.
  const shareDescription = description || SHARE_DESCRIPTION;
  const metaImage = absolute(image, `${SITE_URL}${SHARE_IMAGE_PATH}`);
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
      <meta property="og:description" content={shareDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:width" content={SHARE_IMAGE_WIDTH} />
      <meta property="og:image:height" content={SHARE_IMAGE_HEIGHT} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="vk:image" content={metaImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={shareDescription} />
      <meta name="twitter:image" content={metaImage} />

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
