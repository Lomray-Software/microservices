import type { SchemaObject } from 'openapi3-ts';

const schemaObjectsMock: Record<string, SchemaObject>[] = [
  {
    DynamicModelStText: {
      type: 'object',
      properties: {
        alias1: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: {
              type: 'object',
              properties: { firstField: { type: 'string' }, secField: { type: 'number' } },
            },
          },
        },
        alias2: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: { type: 'object', properties: { thirdField: { type: 'string' } } },
          },
        },
      },
    },
  },
  {
    DynamicModelStAdmin: {
      type: 'object',
      properties: {
        adminBlog: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: { type: 'object', properties: { admins: { $ref: '#/definitions/users.User' } } },
          },
        },
      },
    },
  },
  {
    DynamicModelSt999: {
      type: 'object',
      properties: {
        justText: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: { type: 'object', properties: { justTextInputName: { type: 'string' } } },
          },
        },
      },
    },
  },
  {
    DynamicModelStCustom: {
      type: 'object',
      properties: {
        customComponentWithText: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                customComponent: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        justText: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            data: {
                              type: 'object',
                              properties: { justTextInputName: { type: 'string' } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    DynamicModelStTest000: {
      type: 'object',
      properties: {
        customComponentWithText: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                customComponent: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        justText: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            data: {
                              type: 'object',
                              properties: { justTextInputName: { type: 'string' } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
];

const schemaObjectMock: Record<string, SchemaObject> = {
  DynamicModelStText: {
    type: 'object',
    properties: {
      alias1: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          data: {
            type: 'object',
            properties: { firstField: { type: 'string' }, secField: { type: 'number' } },
          },
        },
      },
      alias2: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          data: { type: 'object', properties: { thirdField: { type: 'string' } } },
        },
      },
    },
  },
  DynamicModelStAdmin: {
    type: 'object',
    properties: {
      adminBlog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          data: { type: 'object', properties: { admins: { $ref: '#/definitions/users.User' } } },
        },
      },
    },
  },
  DynamicModelSt999: {
    type: 'object',
    properties: {
      justText: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          data: { type: 'object', properties: { justTextInputName: { type: 'string' } } },
        },
      },
    },
  },
  DynamicModelStCustom: {
    type: 'object',
    properties: {
      customComponentWithText: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              customComponent: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      justText: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          data: {
                            type: 'object',
                            properties: { justTextInputName: { type: 'string' } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  DynamicModelStTest000: {
    type: 'object',
    properties: {
      customComponentWithText: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              customComponent: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      justText: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          data: {
                            type: 'object',
                            properties: { justTextInputName: { type: 'string' } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export { schemaObjectMock, schemaObjectsMock };
