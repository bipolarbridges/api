import { ModelFactory, Neogma } from 'neogma';
import {
  user,
  measurement,
  resource,
  identity,
  date,
} from '.';

export function initDateModel(db: Neogma): date.DateModel {
  return ModelFactory<date.DateProperties, date.DateRelatedNodes>(
    {
      label: 'Date',
      primaryKeyField: 'id',
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        day: {
          type: 'number',
          required: true,
        },
        month: {
          type: 'number',
          required: true,
        },
        year: {
          type: 'number',
          required: true,
        },
      },
      // relationships: {},
    },
    db,
  );
}

export function initIdentityModel(db: Neogma, resourceModel: resource.ResourceModel)
  : identity.IdentityModel {
  return ModelFactory<identity.IdentityProperties, identity.IdentityRelatedNodes>(
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

export function initMeasurementModel(db: Neogma,
  dateModel: date.DateModel, userModel: user.UserModel): measurement.MeasurementModel {
  return ModelFactory<measurement.MeasurementProperties, measurement.MeasurementRelatedNodes>(
    {
      label: 'Measurement',
      schema: {
        type: {
          type: 'string',
          required: true,
        },
        value: {
          type: 'number',
          required: true,
        },
      },
      relationships: {
        User: {
          model: userModel,
          direction: 'in',
          name: 'Recorded',
        },
        Date: {
          model: dateModel,
          direction: 'out',
          name: 'RecordedAt',
          properties: {
            time: {
              property: 'time',
              schema: {
                type: 'number',
              },
            },
          },
        },
      },
      primaryKeyField: 'type',
    },
    db,
  );
}

export function initResourceModel(db: Neogma): resource.ResourceModel {
  return ModelFactory<resource.ResourceProperties, resource.ResourceRelatedNodes>(
    {
      label: 'Resource',
      schema: {
        path: {
          type: 'string',
          required: true,
        },
      },
    },
    db,
  );
}

export function initUserModel(db: Neogma,
  // measurementModel: measurement.MeasurementModel,
  resourceModel: resource.ResourceModel)
  : user.UserModel {
  return ModelFactory<user.UserProperties, user.UserRelatedNodes>(
    {
      label: 'User',
      schema: {
        uid: {
          type: 'string',
          required: true,
        },
      },
      relationships: {
        /* Measurement: {
          model: measurementModel,
          direction: 'out',
          name: 'Recorded',
        }, */
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
      // relationshipCreationKeys: {}
    },
    db,
  );
}

export type AllModels = {
  date: date.DateModel,
  identity: identity.IdentityModel,
  measurement: measurement.MeasurementModel,
  resource: resource.ResourceModel,
  user: user.UserModel,
};
export function initAllModels(db: Neogma): AllModels {
  const dateModel = initDateModel(db);
  const resourceModel = initResourceModel(db);
  const userModel = initUserModel(db, resourceModel);
  const identityModel = initIdentityModel(db, resourceModel);
  const measurementModel = initMeasurementModel(db, dateModel, userModel);

  return {
    date: dateModel,
    resource: resourceModel,
    measurement: measurementModel,
    identity: identityModel,
    user: userModel,
  };
}
