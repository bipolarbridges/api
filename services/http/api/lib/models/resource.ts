import {
  ModelFactory, Neogma, NeogmaInstance, NeogmaModel,
} from 'neogma';

export type ResourceProperties = {
  path: string
};

export type ResourceRelatedNodes = unknown;

export type ResourceInstance = NeogmaInstance<ResourceProperties, ResourceRelatedNodes>;

export type ResourceModel = NeogmaModel<ResourceProperties, ResourceRelatedNodes>;

export function initResourceModel(db: Neogma): ResourceModel {
  return ModelFactory<ResourceProperties, ResourceRelatedNodes>(
    {
      label: 'Resource',
      schema: {
        path: {
          type: 'string',
          required: true,
        },
      },
      primaryKeyField: 'path',
    },
    db,
  );
}
