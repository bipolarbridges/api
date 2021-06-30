import { NeogmaInstance, NeogmaModel } from 'neogma';

export type DateProperties = {
  day: number,
  month: number,
  year: number,
  id: string
};

export type DateRelatedNodes = unknown;

export type DateInstance = NeogmaInstance<DateProperties, DateRelatedNodes>;

export type DateModel = NeogmaModel<DateProperties, DateRelatedNodes>;
