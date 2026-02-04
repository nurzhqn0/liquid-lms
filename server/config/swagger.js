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
    { name: "Enrollments" },
    { name: "Assignments" },
    { name: "Submissions" },
    { name: "Reviews" }
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
          instructor_id: { type: "string" },
          instructor_name: { type: "string" },
          instructor_avatar: { type: "string" },
          category: { type: "string" },
          subcategory: { type: "string" },
          level: { type: "string" },
          language: { type: "string" },
          price: { type: "number" },
          currency: { type: "string" },
          thumbnail: { type: "string" },
          preview_video: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          is_published: { type: "boolean" },
          learning_objectives: { type: "array", items: { type: "string" } },
          requirements: { type: "array", items: { type: "string" } },
          modules: { type: "array" },
          statistics: { type: "object" },
          ratings: { type: "object" },
          tags: { type: "array", items: { type: "string" } }
        },
        additionalProperties: true
      },
      Enrollment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user_id: { type: "string" },
          course_id: { type: "string" },
          course_title: { type: "string" },
          instructor_name: { type: "string" },
          status: { type: "string" },
          payment_status: { type: "string" },
          amount_paid: { type: "number" },
          payment_method: { type: "string" },
          completion_percentage: { type: "number" }
        },
        additionalProperties: true
      },
      Assignment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          course_id: { type: "string" },
          lesson_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          instructions: { type: "array" },
          max_score: { type: "number" },
          due_date: { type: "string", format: "date-time" },
          type: { type: "string" },
          difficulty: { type: "string" },
          estimated_time_minutes: { type: "number" },
          starter_code: { type: "string" },
          test_cases: { type: "array" },
          rubric: { type: "array" },
          submissions_count: { type: "number" },
          average_score: { type: "number" }
        },
        additionalProperties: true
      },
      Submission: {
        type: "object",
        properties: {
          _id: { type: "string" },
          assignment_id: { type: "string" },
          user_id: { type: "string" },
          enrollment_id: { type: "string" },
          submission_date: { type: "string", format: "date-time" },
          submission_content: { type: "object" },
          status: { type: "string" },
          score: { type: "number" },
          feedback: { type: "string" },
          graded_by: { type: "string" },
          graded_date: { type: "string", format: "date-time" },
          attempt_number: { type: "number" },
          time_spent_minutes: { type: "number" }
        },
        additionalProperties: true
      },
      Review: {
        type: "object",
        properties: {
          _id: { type: "string" },
          course_id: { type: "string" },
          user_id: { type: "string" },
          user_name: { type: "string" },
          user_avatar: { type: "string" },
          rating: { type: "number" },
          title: { type: "string" },
          comment: { type: "string" },
          review_date: { type: "string", format: "date-time" },
          verified_purchase: { type: "boolean" },
          completion_status: { type: "string" },
          completion_percentage: { type: "number" },
          helpful_count: { type: "number" },
          reported: { type: "boolean" },
          instructor_response: { type: "object" }
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
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  first_name: { type: "string" },
                  last_name: { type: "string" },
                  role: { type: "string", enum: ["student", "instructor"] }
                },
                required: ["username", "email", "password"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } }
                }
              }
            }
          },
          "400": {
            description: "Bad request",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          "409": {
            description: "User already exists",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
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
      },
      post: {
        tags: ["Courses"],
        summary: "Create course (instructor)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Course" }
            }
          }
        },
        responses: {
          "201": {
            description: "Course created",
            content: { "application/json": { schema: { type: "object", properties: { course: { $ref: "#/components/schemas/Course" } } } } }
          },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Course already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
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
      },
      patch: {
        tags: ["Courses"],
        summary: "Update course (instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Course" }
            }
          }
        },
        responses: {
          "200": {
            description: "Course updated",
            content: { "application/json": { schema: { type: "object", properties: { course: { $ref: "#/components/schemas/Course" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
    },
    "/api/courses/{id}/assignments": {
      get: {
        tags: ["Assignments"],
        summary: "List assignments for a course",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Assignments list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assignments: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Assignment" }
                    }
                  }
                }
              }
            }
          },
          "404": { description: "Course not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      post: {
        tags: ["Assignments"],
        summary: "Create assignment (instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Assignment" }
            }
          }
        },
        responses: {
          "201": {
            description: "Assignment created",
            content: { "application/json": { schema: { type: "object", properties: { assignment: { $ref: "#/components/schemas/Assignment" } } } } }
          },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Course not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/assignments/{id}": {
      get: {
        tags: ["Assignments"],
        summary: "Get assignment detail",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Assignment detail",
            content: { "application/json": { schema: { type: "object", properties: { assignment: { $ref: "#/components/schemas/Assignment" } } } } }
          },
          "404": { description: "Assignment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      patch: {
        tags: ["Assignments"],
        summary: "Update assignment (instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Assignment" }
            }
          }
        },
        responses: {
          "200": {
            description: "Assignment updated",
            content: { "application/json": { schema: { type: "object", properties: { assignment: { $ref: "#/components/schemas/Assignment" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Assignment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      delete: {
        tags: ["Assignments"],
        summary: "Delete assignment (instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Assignment deleted",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Assignment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/assignments/{id}/submissions": {
      post: {
        tags: ["Submissions"],
        summary: "Create submission (student)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  submission_content: { type: "object" },
                  attempt_number: { type: "number" },
                  time_spent_minutes: { type: "number" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Submission created",
            content: { "application/json": { schema: { type: "object", properties: { submission: { $ref: "#/components/schemas/Submission" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Assignment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      get: {
        tags: ["Submissions"],
        summary: "List submissions for assignment (instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Submissions list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    submissions: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Submission" }
                    }
                  }
                }
              }
            }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Assignment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/submissions/me": {
      get: {
        tags: ["Submissions"],
        summary: "List my submissions (student)",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "My submissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    submissions: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Submission" }
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
    },
    "/api/submissions/{id}": {
      patch: {
        tags: ["Submissions"],
        summary: "Grade submission (instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  score: { type: "number" },
                  feedback: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Submission updated",
            content: { "application/json": { schema: { type: "object", properties: { submission: { $ref: "#/components/schemas/Submission" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Submission not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/courses/{id}/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List reviews for a course",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Reviews list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reviews: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Review" }
                    }
                  }
                }
              }
            }
          },
          "404": { description: "Course not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      post: {
        tags: ["Reviews"],
        summary: "Create review (student)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rating: { type: "number" },
                  title: { type: "string" },
                  comment: { type: "string" }
                },
                required: ["rating"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Review created",
            content: { "application/json": { schema: { type: "object", properties: { review: { $ref: "#/components/schemas/Review" } } } } }
          },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Course not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/reviews/{id}": {
      delete: {
        tags: ["Reviews"],
        summary: "Delete review (owner or instructor)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Review deleted",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } }
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Review not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    }
  }
};

module.exports = { swaggerSpec };
