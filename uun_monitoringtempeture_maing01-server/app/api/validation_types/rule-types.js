/* eslint-disable */

const ruleCreateDtoInType = shape({
  deviceEui: string().isRequired(),
  minC: string(),
  maxC: string(),
  batteryLowV: string(),
});

const ruleListDtoInType = shape({
  deviceEui: string(),
  pageInfo: shape({
    pageIndex: integer(0, 1000000000),
    pageSize: integer(1, 1000),
  }),
});

const ruleUpdateDtoInType = shape({
  id: mongoId().isRequired(),
  minC: string(),
  maxC: string(),
  batteryLowV: string(),
});

const ruleDeleteDtoInType = shape({
  id: mongoId().isRequired(),
});
