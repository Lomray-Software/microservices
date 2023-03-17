import { Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
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

    try {
      const result = _.template(handledTemplate, options)(params);

      return isObject ? JSON.parse(result) : result;
    } catch (e) {
      Log.error(`Failed parse template "${handledTemplate}"`, e);

      throw new BaseException({ message: 'Internal error: failed execute permissions.' });
    }
  }

  /**
   * Handle template
   * @protected
   */
  protected static handleTemplate(template: string): string {
    let value = template;

    // return array strings
    value = value.replace(/"\$array_strings:<%(.+?)%>"/g, '["<%$1%>"]');
    // return array
    value = value.replace(/"\$array:<%(.+?)%>"/g, '[<%$1%>]');
    // return object, number, boolean
    value = value.replace(/"\$(object|number|boolean|null):<%(.+?)%>"/g, '<%$2%>');

    return value;
  }
}

export default Templater;
