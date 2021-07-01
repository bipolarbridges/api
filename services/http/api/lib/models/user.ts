import {
  ModelFactory, ModelRelatedNodesI, Neogma, NeogmaInstance, NeogmaModel,
} from 'neogma';
import { ResourceInstance, ResourceModel } from './resource';

export type UserProperties = {
  uid: string,
  name?: string
};

export type UserRelatedNodes = {
  Resource: ModelRelatedNodesI<ResourceModel, ResourceInstance>
};

export type UserInstance = NeogmaInstance<UserProperties, UserRelatedNodes>;

export type UserModel = NeogmaModel<UserProperties, UserRelatedNodes>;

export function initUserModel(db: Neogma,
  resourceModel: ResourceModel): UserModel {
  return ModelFactory<UserProperties, UserRelatedNodes>(
    {
      label: 'User',
      schema: {
        uid: {
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
      primaryKeyField: 'uid',
    },
    db,
  );
}
