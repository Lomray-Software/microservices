import _ from 'lodash';
import type { TemplateOptions } from 'lodash';

/**
 * Compile template expressions
 */
class Templater {
  /**
   * Compile template
   */
  public static compile<T extends string | Record<string, any>>(
    template: T,
    params: Record<string, any> = {},
    options?: TemplateOptions,
  ): T {
    if (!template) {
      return template;
    }

    const isObject = typeof template !== 'string';
    const handledTemplate = this.handleTemplate(isObject ? JSON.stringify(template) : template);
    const result = _.template(handledTemplate, options)(params);

    return isObject ? JSON.parse(result) : result;
  }

  /**
   * Handle template
   * @protected
   */
  protected static handleTemplate(template: string): string {
    let value = template;

    // return array
    value = value.replace(/"\$array:(.+?)"/g, '$1');
    // return object
    value = value.replace(/"\$object:(.+?)"/g, '$1');
    // return number
    value = value.replace(/"\$number:(.+?)"/g, '$1');
    // return boolean
    value = value.replace(/"\$boolean:(.+?)"/g, '$1');

    return value;
  }
}

export default Templater;
