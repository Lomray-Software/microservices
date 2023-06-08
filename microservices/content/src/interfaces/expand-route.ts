interface IExpandRouteInput {
  route: string;
  relations?: string[];
  attributes?: string[];
}

interface IExpandRoute extends IExpandRouteInput {
  microservice: string;
  entity: string;
  hasMany?: boolean;
}

export { IExpandRoute, IExpandRouteInput };
