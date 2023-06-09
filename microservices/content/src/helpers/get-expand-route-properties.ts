interface IProperties {
  properties: string[];
  lastIndex: number;
}

/**
 * Returns expand route properties and last index
 */
const getExpandRouteProperties = (route: string): IProperties => {
  const properties = route.split('.');

  return { properties, lastIndex: properties.length - 1 };
};

export default getExpandRouteProperties;
