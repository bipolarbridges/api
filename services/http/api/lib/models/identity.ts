import {
  ModelFactory, ModelRelatedNodesI, Neogma, NeogmaInstance, NeogmaModel,
} from 'neogma';
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

export function initIdentityModel(db: Neogma,
  resourceModel: ResourceModel): IdentityModel {
  return ModelFactory<IdentityProperties, IdentityRelatedNodes>(
    {
      label: 'Identity',
      schema: {
        type: {
          type: 'string',
          required: true,
        },
        name: {
          type: 'string',
          required: true,
        },
        check: {
          type: 'string',
          required: true,
        },
      },
      relationships: {
        Resource: {
          model: resourceModel,
          direction: 'out',
          name: 'Can',
          properties: {
            method: {
              property: 'method',
              schema: {
                type: 'string',
              },
            },
          },

        },
      },
      primaryKeyField: 'name',
    },
    db,
  );
}
