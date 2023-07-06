import { Attachment } from 'nodemailer/lib/mailer';

/**
 * Attachment
 */
interface IAttachment extends Pick<Attachment, 'filename' | 'encoding' | 'content'> {}

export default IAttachment;
