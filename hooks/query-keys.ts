export const queryKeys = {
  courseCategories: {
    all: ['course-categories'] as const,
    lists: () => [...queryKeys.courseCategories.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.courseCategories.lists(), params] as const,
    details: () => [...queryKeys.courseCategories.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.courseCategories.details(), id] as const,
  },
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (params: object) => [...queryKeys.courses.lists(), params] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
  },
  dashboard: {
    all: ['dashboard-summary'] as const,
  },
  enrollments: {
    all: ['enrollments'] as const,
    lists: () => [...queryKeys.enrollments.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.enrollments.lists(), params] as const,
    details: () => [...queryKeys.enrollments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.enrollments.details(), id] as const,
  },
  intakes: {
    all: ['intakes'] as const,
    lists: () => [...queryKeys.intakes.all, 'list'] as const,
    list: (params: object) => [...queryKeys.intakes.lists(), params] as const,
    details: () => [...queryKeys.intakes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.intakes.details(), id] as const,
  },
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (params: object) => [...queryKeys.payments.lists(), params] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
  },
  profiles: {
    all: ['profiles'] as const,
    lists: () => [...queryKeys.profiles.all, 'list'] as const,
    list: (params: object) => [...queryKeys.profiles.lists(), params] as const,
    details: () => [...queryKeys.profiles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.profiles.details(), id] as const,
  },
  refunds: {
    all: ['refunds'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  publicCourses: {
    all: ['public-courses'] as const,
    lists: () => [...queryKeys.publicCourses.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.publicCourses.lists(), params] as const,
    details: () => [...queryKeys.publicCourses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.publicCourses.details(), id] as const,
  },
  userPaymentHistory: {
    all: ['user-payment-history'] as const,
  },
};
