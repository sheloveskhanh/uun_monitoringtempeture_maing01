/* eslint-disable */

const locationCreateDtoInType = shape({
  name: string(3, 255).isRequired(),
  description: string(3, 4000),
});

const locationGetDtoInType = shape({
  id: mongoId().isRequired(),
});

const locationListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000000000),
  }),
});

const locationUpdateDtoInType = shape({
  id: mongoId().isRequired(),
  name: string(3, 255),
  description: string(3, 4000),
});

const locationDeleteDtoInType = shape({
  id: mongoId().isRequired(),
});
