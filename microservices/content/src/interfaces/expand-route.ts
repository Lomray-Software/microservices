interface IExpandRouteInput {
  name: string;
  isOptional?: boolean;
  relations?: string[];
  attributes?: string[];
}

interface IExpandRoute extends IExpandRouteInput {
  microservice: string;
  entity: string;
  hasMany?: boolean;
}

export { IExpandRoute, IExpandRouteInput };
