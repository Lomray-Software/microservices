import { v4 as uuidv4 } from 'uuid';

/**
 * Create personal access token
 */
class Personal {
  /**
   * Generate personal access token
   */
  static generate(): string {
    return uuidv4().replace(/-/g, '');
  }
}

export default Personal;
