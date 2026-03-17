/* eslint-disable */

const readingCreateDtoInType = shape({
  device_eui: string().isRequired(),
  timestamp: string(),
  processed_at: string(),
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