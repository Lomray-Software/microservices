import type nodemailer from 'nodemailer';
import type EmailProvider from '@constants/email-provider';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  emailProvider?: EmailProvider;
  defaultEmailFrom?: string;
  transportOptions?: Parameters<typeof nodemailer.createTransport>[0];
}
