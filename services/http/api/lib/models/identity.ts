import { ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from 'neogma';
import { ResourceInstance, ResourceModel } from './resource';

export type IdentityProperties = {
  type: string,
  name: string,
  check: string
};

export type IdentityRelatedNodes = {
  Resource: ModelRelatedNodesI<ResourceModel, ResourceInstance>
};

export type IdentityInstance = NeogmaInstance<IdentityProperties, IdentityRelatedNodes>;

export type IdentityModel = NeogmaModel<IdentityProperties, IdentityRelatedNodes>;
