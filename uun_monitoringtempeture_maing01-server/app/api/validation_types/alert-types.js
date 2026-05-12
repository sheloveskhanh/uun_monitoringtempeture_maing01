/* eslint-disable */

const alertCreateDtoInType = shape({
  deviceEui: string().isRequired(),
  type: string().isRequired(),
  message: string().isRequired(),
  severity: string(),
});

const alertListDtoInType = shape({
  deviceEui: string(),
  status: string(),
  severity: string(),
  from: string(),
  to: string(),
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000),
  }),
});

const alertAcknowledgeDtoInType = shape({
  id: mongoId().isRequired(),
});

const alertDeleteDtoInType = shape({
  id: mongoId().isRequired(),
});
