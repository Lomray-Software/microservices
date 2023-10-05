interface IAddress {
  // City, district, suburb, town, village, or ward.
  city?: string;
  // Two-letter country code ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)).
  country?: string;
  // Address line 1 (e.g., street, block, PO Box, or company name).
  line1?: string;
  // Address line 2 (e.g., apartment, suite, unit, or building).
  line2?: string;
  // ZIP or postal code.
  postalCode?: string;
  // State, county, province, prefecture, or region
  state?: string;
}

export default IAddress;
