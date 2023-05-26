/**
 * Messages
 */
type TGetMessageSignature = (entityName: string) => string;

type TMessages = Record<'getNotFoundMessage' | 'getIsNotDefined', TGetMessageSignature>;

const messages: TMessages = {
  getNotFoundMessage: (entityName: string) => `${entityName} isn't found.`,
  getIsNotDefined: (entityName: string) => `${entityName} isn't defined.`,
};

export default messages;
