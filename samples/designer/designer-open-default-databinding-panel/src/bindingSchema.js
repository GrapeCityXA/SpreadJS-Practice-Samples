var bindingSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  properties: {
    姓名: { dataFieldType: "text", type: "string" },
    履历: {
      dataFieldType: "table",
      type: "array",
      items: {
        type: "object",
        properties: { 时间: { type: "string" }, 公司: { type: "string" } },
      },
    },
  },
  type: "object",
};
