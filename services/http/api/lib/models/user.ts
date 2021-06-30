import { ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from 'neogma';
import { ResourceInstance, ResourceModel } from './resource';

export type UserProperties = {
  uid: string,
  name?: string
};

export type UserRelatedNodes = {
  // Measurement: ModelRelatedNodesI<MeasurementModel, MeasurementInstance>,
  Resource: ModelRelatedNodesI<ResourceModel, ResourceInstance>
};

export type UserInstance = NeogmaInstance<UserProperties, UserRelatedNodes>;

export type UserModel = NeogmaModel<UserProperties, UserRelatedNodes>;
