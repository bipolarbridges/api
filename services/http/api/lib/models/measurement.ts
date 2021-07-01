/* eslint-disable import/no-cycle */
import {
  ModelFactory, ModelRelatedNodesI, Neogma, NeogmaInstance, NeogmaModel,
} from 'neogma';
import {
  DayInstance, DayModel,
  HourInstance, HourModel,
  MonthInstance, MonthModel,
  TimestampInstance, TimestampModel,
  YearInstance, YearModel,
} from './time';
import { SourceInstance, SourceModel } from './source';
import { UserInstance, UserModel } from './user';

/**
 * MeasurementType
 */
export type MeasurementTypeProperties = {
  name: string,
};

export type MeasurementTypeRelatedNodesI = {
  Measurement: ModelRelatedNodesI<MeasurementModel, MeasurementInstance>,
  Source: ModelRelatedNodesI<SourceModel, SourceInstance>;
};

export type MeasurementTypeInstance =
NeogmaInstance<MeasurementTypeProperties, MeasurementTypeRelatedNodesI>;

export type MeasurementTypeModel =
NeogmaModel<MeasurementTypeProperties, MeasurementTypeRelatedNodesI>;

export function initMeasurementTypeModel(db: Neogma,
  valueModel: MeasurementModel, sourceModel: SourceModel): MeasurementTypeModel {
  return ModelFactory<MeasurementTypeProperties, MeasurementTypeRelatedNodesI>(
    {
      label: 'MeasurementType',
      schema: {
        name: {
          type: 'string',
          required: true,
        },
      },
      relationships: {
        Measurement: {
          model: valueModel,
          direction: 'out',
          name: 'Includes',
        },
        Source: {
          model: sourceModel,
          direction: 'in',
          name: 'Includes',
        },
      },
      primaryKeyField: 'name',
    },
    db,
  );
}

/**
 * Measurement
 */
export type MeasurementProperties = {
  value: number,
};

export type MeasurementRelatedNodes = {
  User: ModelRelatedNodesI<UserModel, UserInstance>,
  Hour: ModelRelatedNodesI<HourModel, HourInstance>;
  Day: ModelRelatedNodesI<DayModel, DayInstance>;
  Month: ModelRelatedNodesI<MonthModel, MonthInstance>;
  Year: ModelRelatedNodesI<YearModel, YearInstance>;
  Timestamp: ModelRelatedNodesI<TimestampModel, TimestampInstance>;
  MeasurementType: ModelRelatedNodesI<MeasurementTypeModel, MeasurementTypeInstance>;
};

export type MeasurementInstance = NeogmaInstance<MeasurementProperties, MeasurementRelatedNodes>;

export type MeasurementModel = NeogmaModel<MeasurementProperties, MeasurementRelatedNodes>;

export function initMeasurementModel(db: Neogma,
  hourModel: HourModel, dayModel: DayModel, monthModel: MonthModel,
  yearModel: YearModel, timestampModel: TimestampModel,
  userModel: UserModel): MeasurementModel {
  return ModelFactory<MeasurementProperties, MeasurementRelatedNodes>(
    {
      label: 'Measurement',
      schema: {
        value: {
          type: 'number',
          required: true,
        },
      },
      relationships: {
        Hour: {
          model: hourModel,
          direction: 'out',
          name: 'RecordedAt',
        },
        Day: {
          model: dayModel,
          direction: 'out',
          name: 'RecordedOn',
        },
        Month: {
          model: monthModel,
          direction: 'out',
          name: 'RecordedOn',
        },
        Year: {
          model: yearModel,
          direction: 'out',
          name: 'RecordedOn',
        },
        Timestamp: {
          model: timestampModel,
          direction: 'out',
          name: 'RecordedAt',
        },
        User: {
          model: userModel,
          direction: 'in',
          name: 'Recorded',
        },
      },
    },
    db,
  );
}
