import { ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from 'neogma';
import { UserModel, UserInstance } from './user';
import { DateInstance, DateModel } from './date';

export type MeasurementProperties = {
  type: string,
  value: number
};

export type MeasurementRelatedNodes = {
  User: ModelRelatedNodesI<UserModel, UserInstance>,
  Date: ModelRelatedNodesI<DateModel, DateInstance>
};

export type MeasurementInstance = NeogmaInstance<MeasurementProperties, MeasurementRelatedNodes>;

export type MeasurementModel = NeogmaModel<MeasurementProperties, MeasurementRelatedNodes>;
