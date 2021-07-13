import * as user from './user';
import * as measurement from './measurement';
import * as resource from './resource';
import * as identity from './identity';
import * as source from './source';
import * as time from './time';

type AllModels = {
  identity: identity.IdentityModel,
  measurementType: measurement.MeasurementTypeModel,
  resource: resource.ResourceModel,
  user: user.UserModel,
  source: source.SourceModel,
  hour: time.HourModel,
  day: time.DayModel,
  month: time.MonthModel,
  year: time.YearModel,
  timestamp: time.TimestampModel,
  measurement: measurement.MeasurementModel
};

export {
  user,
  measurement,
  resource,
  identity,
  source,
  time,
  AllModels,
};
