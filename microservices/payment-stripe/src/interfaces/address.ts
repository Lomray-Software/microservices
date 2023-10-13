import { IsUndefinable } from '@lomray/microservice-helpers';
import { IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

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

/**
 * Address with validation decorators
 */
class Address implements IAddress {
  @IsString()
  @IsUndefinable()
  city?: string;

  @IsString()
  @IsUndefinable()
  country?: string;

  @IsString()
  @IsUndefinable()
  line1?: string;

  @IsString()
  @IsUndefinable()
  line2?: string;

  @JSONSchema({
    description: 'Required for tax compute',
  })
  @IsString()
  @IsUndefinable()
  postalCode?: string;

  @IsString()
  @IsUndefinable()
  state?: string;
}

export { IAddress, Address };
