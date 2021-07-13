import { Session } from 'neo4j-driver';
import { AllModels } from '../models';
import {
  DayProperties, HourProperties, TimestampProperties, YearProperties,
} from '../models/time';
import { MeasurementProperties, MeasurementTypeProperties } from '../models/measurement';
import { UserProperties } from '../models/user';
import { SourceProperties } from '../models/source';
import { DatabaseProcedure } from '../db';
import * as loggers from '../logging';

function userExists(id: string): DatabaseProcedure<boolean> {
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

function createUser(id: string): DatabaseProcedure<boolean> {
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
        { merge: true, session },
      );

      return null;
    } catch (err) {
      loggers.error(err);
      return null;
    }
  };
}

// named with format VerbModelArgs
export type CreateMeasurementArgs = {
  uid: string,
  value: number,
  name: string,
  source: string,
  date: number,
};

type MergeConfig = {
  nodes: boolean,
  relationship: boolean,
};

type MergeProperties = {
  Hour: {
    propertiesMergeConfig: MergeConfig,
    properties: HourProperties[]
  },
  Day: DayMergeProperties,
  Month: MonthMergeProperties,
  Year: {
    propertiesMergeConfig: MergeConfig,
    properties: YearProperties[]
  },
  Timestamp: {
    propertiesMergeConfig: MergeConfig,
    properties: TimestampProperties[]
  },
  User?: UserMergeProperties,
  MeasurementType?: {
    propertiesMergeConfig: MergeConfig,
    properties: CombinedTypeSource[]
  }
};

type UserMergeProperties = {
  propertiesMergeConfig: MergeConfig,
  properties: UserProperties[]
};

type MeasurementTypeMergeProperties = {
  propertiesMergeConfig: MergeConfig,
  properties: CombinedTypeSource[],
};

type DayMergeProperties = {
  propertiesMergeConfig: MergeConfig,
  properties: DayProperties[]
};

type MonthMergeProperties = {
  propertiesMergeConfig: MergeConfig,
  properties: {
    month: number,
    Day?: DayMergeProperties
  }[]
};

type SourceMergeProperties = {
  propertiesMergeConfig: MergeConfig,
  properties: SourceProperties[],
};

type CombinedTypeSource = MeasurementTypeProperties & { Source: SourceMergeProperties };

export type MergedMeasurement = MeasurementProperties & MergeProperties;

export function makeMeasurementProperties(value: number,
  hour: number,
  day: number,
  month: number,
  year: number,
  time: number,
  User?: UserMergeProperties,
  MeasurementType?: MeasurementTypeMergeProperties): MergedMeasurement {
  return {
    value,
    Hour: {
      propertiesMergeConfig: {
        nodes: true,
        relationship: false,
      },
      properties: [
        { hour },
      ],
    },
    Day: {
      propertiesMergeConfig: {
        nodes: true,
        relationship: false,
      },
      properties: [
        { day },
      ],
    },
    Month: {
      propertiesMergeConfig: {
        nodes: true,
        relationship: false,
      },
      properties: [
        {
          month,
          Day: {
            propertiesMergeConfig: {
              nodes: true,
              relationship: true,
            },
            properties: [
              { day },
            ],
          },
        },
      ],
    },
    Year: {
      propertiesMergeConfig: {
        nodes: true,
        relationship: true,
      },
      properties: [
        { year },
      ],
    },
    Timestamp: {
      propertiesMergeConfig: {
        nodes: true,
        relationship: false,
      },
      properties: [
        { time },
      ],
    },
    User,
    MeasurementType,

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
  const hour = date.getHours();

  return {
    year,
    month,
    day,
    hour,
    time,
  };
}

function createMeasurement(m: CreateMeasurementArgs): DatabaseProcedure<boolean> {
  return async (session: Session, models: AllModels): Promise<boolean> => {
    try {
      const {
        year, month, day, hour, time,
      } = transformDate(m.date);
      const {
        uid, source, value, name,
      } = m;

      const User = {
        propertiesMergeConfig: {
          nodes: true,
          relationship: true,

        },
        properties: [{
          uid,
        }],
      };

      const Measurement = {
        propertiesMergeConfig: {
          nodes: false,
          relationship: false,
        },
        properties: [makeMeasurementProperties(value, hour, day, month, year, time, User)],
      };

      const Source = {
        propertiesMergeConfig: {
          nodes: true,
          relationship: true,

        },
        properties: [
          {
            name: source,
          },
        ],
      };

      await models.measurementType.createOne(
        {
          name,
          Measurement,
          Source,
        },
        { session, merge: true },
      );
      return true;
    } catch (err) {
      loggers.error(err);
      loggers.error(err?.data?.errors);
      return false;
    }
  };
}

export default {
  userExists,
  createUser,
  createMeasurement,
};
