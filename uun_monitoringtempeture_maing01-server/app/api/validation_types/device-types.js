/* eslint-disable */

const deviceCreateDtoInType = shape({
  name: string(3, 255).isRequired(),
  description: string(3, 4000),
  deviceEui: string(3, 64).isRequired(),
});

const deviceListDtoInType = shape({
  state: string(),
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000000000),
  }),
});

const deviceDeleteDtoInType = shape({
  id: mongoId().isRequired(),
});

const deviceSetStateDtoInType = shape({
  id: mongoId().isRequired(),
  state: string().isRequired(),
});

const deviceUpdateDtoInType = shape({
  id: mongoId().isRequired(),
  name: string(3, 255),
  description: string(3, 4000),
});
