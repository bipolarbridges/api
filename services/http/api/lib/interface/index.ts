import { Session } from 'neo4j-driver-core';
import { AllModels } from 'lib/models/initializers';
import * as loggers from '../logging';

function userExists(id: string) {
  return async (session: Session, models: AllModels): Promise<boolean> => {
    try {
      const user = await models.user.findOne({
        where: {
          uid: id,
        },
        session,
      });
      const exist = user ? user?.__existsInDatabase : false;
      loggers.info(`User exists: ${exist}`);
      return exist;
    } catch (err) {
      loggers.error(err);
      return false;
    }
  };
}

function createUser(id: string) {
  return async (session: Session, models: AllModels): Promise<null> => {
    try {
      await models.user.createOne(
        {
          uid: id,
          Resource: {
            propertiesMergeConfig: {
              nodes: true,
              relationship: true,
            },
            properties: [
              {
                path: `/client/${id}`,
                method: 'GET',
              },
            ],
          },

        },
        { session },
      );

      return null;
    } catch (err) {
      loggers.error(err);
      return null;
    }
  };
}

// Takes in a second number input, converts it to milliseconds
// and returns
// - the year
// - the month (0-11)
// - the day of the month (1-31)
// - the time in milliseconds
function transformDate(input: number) {
  const date = new Date(input * 1000);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const time = date.getTime();

  return {
    year,
    month,
    day,
    time,
  };
}

// named with format VerbModelArgs
export type CreateMeasurementArgs = {
  date: number,
  uid: string,
  type: string,
  value: number
};

function createMeasurement(m: CreateMeasurementArgs) {
  return async (session: Session, models: AllModels): Promise<boolean> => {
    const date = transformDate(m.date);
    try {
      await models.measurement.createOne(
        {
          type: m.type,
          value: m.value,
          User: {
            propertiesMergeConfig: {
              nodes: true,
              relationship: true,
            },
            properties: [{
              uid: m.uid,
            }],
          },
          Date: {
            propertiesMergeConfig: {
              nodes: true,
              relationship: true,
            },
            properties: [{
              id: `${date.year}-${date.month}-${date.day}`,
              time: date.time,
              day: date.day,
              month: date.month,
              year: date.year,
            }],
          },
        },
        { session, merge: true },
      );
      return true;
    } catch (err) {
      loggers.error(err);
      return false;
    }
  };
}

export default {
  userExists,
  createUser,
  createMeasurement,
};
