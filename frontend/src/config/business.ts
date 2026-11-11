/** NAP canónico. El mismo nombre, dirección y teléfono en toda la web. */
export const BUSINESS = {
    name: 'Aruṇāchala Yoga y Terapias',
    street: 'Pasaje de Mateo Oliva 3, bajos',
    postalCode: '08940',
    locality: 'Cornellà de Llobregat',
    region: 'Barcelona',
    country: 'ES',
    phoneDisplay: '+34 678 481 971',
    phoneTel: '+34678481971',
    email: 'yogayterapiasarunachala@gmail.com',
    url: 'https://www.yogayterapiasarunachala.es',
} as const;

export const BUSINESS_ADDRESS_LINE = `${BUSINESS.street}, ${BUSINESS.postalCode} ${BUSINESS.locality}, ${BUSINESS.region}`;

export const businessPostalAddress = {
    '@type': 'PostalAddress' as const,
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.locality,
    postalCode: BUSINESS.postalCode,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.country,
};
