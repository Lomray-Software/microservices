import Component from '@entities/component';

const isComponent = (obj: unknown): obj is Component => obj instanceof Component;

export default isComponent;
