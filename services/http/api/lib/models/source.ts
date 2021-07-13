import {
  ModelFactory, Neogma, NeogmaInstance, NeogmaModel,
} from 'neogma';

export type SourceProperties = {
  name: string
};

export type SourceRelatedNodes = unknown;

export type SourceInstance = NeogmaInstance<SourceProperties, SourceRelatedNodes>;

export type SourceModel = NeogmaModel<SourceProperties, SourceRelatedNodes>;

export function initSourceModel(db: Neogma): SourceModel {
  return ModelFactory<SourceProperties, SourceRelatedNodes>(
    {
      label: 'Source',
      schema: {
        name: {
          type: 'string',
          required: true,
        },
      },
      primaryKeyField: 'name',
    },
    db,
  );
}
