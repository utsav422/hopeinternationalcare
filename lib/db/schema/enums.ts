// /utils/db/schema/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';
export const durationType = pgEnum('duration_type', [
    'days',
    'week',
    'month',
    'year',
]);

export const enrollmentStatus = pgEnum('enrollment_status', [
    'requested',
    'enrolled',
    'cancelled',
    'completed', // Added 'completed' status
]);
export const paymentStatus = pgEnum('payment_status', [
    'pending',
    'completed',
    'cancelled',
    'failed',
    'refunded',
]);
export const paymentMethod = pgEnum('payment_method', [
    'cash',
    'bank_transfer',
    'mobile_wallets',
    'fonepay',
]);
export const PaymentMethod = z.enum(paymentMethod.enumValues).enum;
export type TypePaymentMethod =
    | typeof PaymentMethod.cash
    | typeof PaymentMethod.bank_transfer
    | typeof PaymentMethod.fonepay
    | typeof PaymentMethod.mobile_wallets;
export const PaymentStatus = z.enum(paymentStatus.enumValues).enum;
export type TypePaymentStatus =
    | typeof PaymentStatus.completed
    | typeof PaymentStatus.failed
    | typeof PaymentStatus.pending
    | typeof PaymentStatus.cancelled
    | typeof PaymentStatus.refunded;

export const EnrollmentStatus = z.enum(enrollmentStatus.enumValues).enum;
export type TypeEnrollmentStatus =
    | typeof EnrollmentStatus.cancelled
    | typeof EnrollmentStatus.enrolled
    | typeof EnrollmentStatus.requested
    | typeof EnrollmentStatus.completed; // Added 'completed' to type

export const DurationType = z.enum(durationType.enumValues).enum;
export type TypeDurationType =
    | typeof DurationType.days
    | typeof DurationType.month
    | typeof DurationType.week
    | typeof DurationType.year;
