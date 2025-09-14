export const queryKeys = {
    affiliations: {
        all: ['affiliations'] as const,
        lists: () => [...queryKeys.affiliations.all, 'list'] as const,
        list: (params: object) => [...queryKeys.affiliations.lists(), params] as const,
        details: () => [...queryKeys.affiliations.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.affiliations.details(), id] as const,
    },
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
        totalUsers: ['total-users'] as const,
        totalEnrollment: ['total-enrollment'] as const,
        enrollmentByStatus: ['enrollment-by-status'] as const,
        totalIncome: ['total-income'] as const,
        paymentByStatus: ['payment-by-status'] as const,
    },
    enrollments: {
        all: ['enrollments'] as const,
        lists: () => [...queryKeys.enrollments.all, 'list'] as const,
        list: (params: object) =>
            [...queryKeys.enrollments.lists(), params] as const,
        details: () => [...queryKeys.enrollments.all, 'detail'] as const,
        detailByUserId: (userId: string) =>
            [...queryKeys.enrollments.details(), userId] as const,
        detailByPaymentId: (paymentId: string) =>
            [...queryKeys.enrollments.details(), paymentId] as const,
        detail: (id: string) => [...queryKeys.enrollments.details(), id] as const,
    },
    intakes: {
        all: ['intakes'] as const,
        upCommingIntakes: ['up-comming-intakes'] as const,
        activeIntakes: ['active-intakes'] as const,
        inActiveIntakes: ['in-active-intakes'] as const,
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
        detailByEnrollment: (id: string) =>
            [...queryKeys.payments.details(), id] as const,
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
        lists: () => [...queryKeys.refunds.all, 'list'] as const,
        list: (params: object) => [...queryKeys.refunds.lists(), params] as const,
    },
    customerContactRequests: {
        all: ['customer-contact-requests'] as const,
        lists: () => [...queryKeys.customerContactRequests.all, 'list'] as const,
        list: (params: object) =>
            [...queryKeys.customerContactRequests.lists(), params] as const,
        details: () =>
            [...queryKeys.customerContactRequests.all, 'detail'] as const,
        detail: (id: string) =>
            [...queryKeys.customerContactRequests.details(), id] as const,
    },
    relatedCourses: {
        all: ['related-courses'] as const,
        detail: (courseId: string, categoryId: string) =>
            [...queryKeys.relatedCourses.all, courseId, categoryId] as const,
    },
    newCourses: {
        all: ['new-courses'] as const,
    },
    users: {
        all: ['users'] as const,
        list: (params: object) =>
            [...queryKeys.users.all, 'list', params] as const,
        detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
        session: ['session'] as const,
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
