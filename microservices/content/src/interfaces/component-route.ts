import { IExpandRouteInput } from '@interfaces/expand-route';

interface IComponentRoute extends IExpandRouteInput {
  componentId: string;
  componentDataName: string;
  name: string;
  hasMany?: boolean;
}

export default IComponentRoute;
