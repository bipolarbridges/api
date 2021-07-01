import {
  ModelFactory, ModelRelatedNodesI, Neogma, NeogmaInstance, NeogmaModel,
} from 'neogma';

/**
 * Hour
 */
export type HourProperties = {
  hour: number
};

export type HourRelatedNodes = unknown;

export type HourInstance = NeogmaInstance<HourProperties, HourRelatedNodes>;

export type HourModel = NeogmaModel<HourProperties, HourRelatedNodes>;

export function initHourModel(db: Neogma): HourModel {
  return ModelFactory<HourProperties, HourRelatedNodes>(
    {
      label: 'Hour',
      primaryKeyField: 'hour',
      schema: {
        hour: {
          type: 'number',
          required: true,
        },
      },
    },
    db,
  );
}

/**
 * Timestamp
 */
export type TimestampProperties = {
  time: number
};

export type TimestampRelatedNodes = unknown;

export type TimestampInstance = NeogmaInstance<TimestampProperties, TimestampRelatedNodes>;

export type TimestampModel = NeogmaModel<TimestampProperties, TimestampRelatedNodes>;

export function initTimestampModel(db: Neogma): TimestampModel {
  return ModelFactory<TimestampProperties, TimestampRelatedNodes>(
    {
      label: 'Timestamp',
      primaryKeyField: 'time',
      schema: {
        time: {
          type: 'number',
          required: true,
        },
      },
    },
    db,
  );
}

/**
 * Day
 */
export type DayProperties = {
  day: number
};

export type DayRelatedNodes = unknown;

export type DayInstance = NeogmaInstance<DayProperties, DayRelatedNodes>;

export type DayModel = NeogmaModel<DayProperties, DayRelatedNodes>;

export function initDayModel(db: Neogma): DayModel {
  return ModelFactory<DayProperties, DayRelatedNodes>(
    {
      label: 'Day',
      primaryKeyField: 'day',
      schema: {
        day: {
          type: 'number',
          required: true,
        },
      },
    },
    db,
  );
}

/**
 * Month
 */
export type MonthProperties = {
  month: number
};

export type MonthRelatedNodes = {
  Day: ModelRelatedNodesI<DayModel, DayInstance>,
};

export type MonthInstance = NeogmaInstance<MonthProperties, MonthRelatedNodes>;

export type MonthModel = NeogmaModel<MonthProperties, MonthRelatedNodes>;

export function initMonthModel(db: Neogma, dayModel: DayModel): MonthModel {
  return ModelFactory<MonthProperties, MonthRelatedNodes>(
    {
      label: 'Month',
      primaryKeyField: 'month',
      schema: {
        month: {
          type: 'number',
          required: true,
        },
      },
      relationships: {
        Day: {
          model: dayModel,
          direction: 'out',
          name: 'Includes',
        },
      },
    },
    db,
  );
}

/**
 * Year
 */
export type YearProperties = {
  year: number
};

export type YearRelatedNodes = unknown;

export type YearInstance = NeogmaInstance<YearProperties, YearRelatedNodes>;

export type YearModel = NeogmaModel<YearProperties, YearRelatedNodes>;

export function initYearModel(db: Neogma): YearModel {
  return ModelFactory<YearProperties, YearRelatedNodes>(
    {
      label: 'Year',
      primaryKeyField: 'year',
      schema: {
        year: {
          type: 'number',
          required: true,
        },
      },
    },
    db,
  );
}
