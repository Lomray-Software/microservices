interface IComponentRoute {
  componentId: string;
  componentDataName: string;
  route: string;
  hasMany?: boolean;
}

export default IComponentRoute;
