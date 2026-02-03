const env = require("./env");

const serverUrl = process.env.API_BASE_URL || `http://localhost:${env.port}`;

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Liquid LMS API",
    version: "1.0.0",
    description: "Backend API for the Liquid LMS MVP"
  },
  servers: [{ url: serverUrl }],
  tags: [
    { name: "Auth" },
    { name: "Courses" },
    { name: "Enrollments" }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" }
        }
      },
      Course: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          modules: { type: "array" }
        },
        additionalProperties: true
      },
      Enrollment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user_id: { type: "string" },
          course_id: { type: "string" },
          status: { type: "string" },
          completion_percentage: { type: "number" }
        },
        additionalProperties: true
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" }
        }
      }
    }
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email or username",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  identifier: { type: "string" },
                  password: { type: "string" }
                },
                required: ["identifier", "password"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Login success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } }
                }
              }
            }
          },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and clear auth cookie",
        responses: {
          "200": {
            description: "Logout success",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } }
                }
              }
            }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "List courses",
        responses: {
          "200": {
            description: "Course list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    courses: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Course" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/courses/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Get course detail",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Course detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { course: { $ref: "#/components/schemas/Course" } }
                }
              }
            }
          },
          "404": { description: "Course not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/courses/{id}/enroll": {
      post: {
        tags: ["Enrollments"],
        summary: "Enroll in a course",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "201": {
            description: "Enrollment created",
            content: { "application/json": { schema: { type: "object", properties: { enrollment: { $ref: "#/components/schemas/Enrollment" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Course not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Already enrolled", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      delete: {
        tags: ["Enrollments"],
        summary: "Unenroll from a course",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Unenrolled",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/enrollments/me": {
      get: {
        tags: ["Enrollments"],
        summary: "List my enrollments",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "My enrollments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    enrollments: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Enrollment" }
                    }
                  }
                }
              }
            }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    }
  }
};

module.exports = { swaggerSpec };
