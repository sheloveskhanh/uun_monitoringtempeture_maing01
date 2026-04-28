/* eslint-disable */

const gatewayCreateDtoInType = shape({
  name: string(3, 255).isRequired(),
  description: string(3, 4000),
  uuIdentity: string(3, 255).isRequired(),
});

const gatewayListDtoInType = shape({
  state: string(),
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000000000),
  }),
});

const gatewayDeleteDtoInType = shape({
  id: mongoId().isRequired(),
});

const gatewaySetStateDtoInType = shape({
  id: mongoId().isRequired(),
  state: string().isRequired(),
});
