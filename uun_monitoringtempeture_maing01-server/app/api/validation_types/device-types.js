/* eslint-disable */
const deviceCreateDtoInType = shape({
  name: string(3, 255).isRequired(),
  description: string(3, 4000),
  uuThing: uuIdentity().isRequired(),
});

const deviceListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000000000),
  }),
});

const deviceDeleteDtoInType = shape({
  id: mongoId().isRequired(),
});
