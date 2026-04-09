/* eslint-disable */

const readingCreateDtoInType = shape({
  deviceEui: string().isRequired(),
  timestamp: string(),
  processedAt: string(),
  temperature: string(),
  voltageRest: string(),
  voltageLoad: string(),
  w1Thermometers: array(),
  orientation: string(),
  currentLoad: string(),
  bleTags: array(),
});

const readingListDtoInType = shape({
  deviceEui: string(),
  from: string(),
  to: string(),
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000),
  }),
});
