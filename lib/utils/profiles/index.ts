import { db } from '@/lib/db/drizzle';
import { profiles } from '@/lib/db/schema/profiles';
import { eq, sql } from 'drizzle-orm';
import { ProfileCreateData, ProfileUpdateData, ProfileConstraintCheck } from '@/lib/types';

/**
 * Profile validation utilities
 */

export class ProfileValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'ProfileValidationError';
    }
}

/**
 * Validates profile first name
 * @param firstName - The first name to validate
 * @throws ProfileValidationError if validation fails
 */
export function validateFirstName(firstName: string): void {
    if (!firstName || firstName.length < 1) {
        throw new ProfileValidationError(
            'First name is required',
            'FIRST_NAME_REQUIRED',
            { firstName }
        );
    }

    if (firstName.length > 50) {
        throw new ProfileValidationError(
            'First name cannot exceed 50 characters',
            'FIRST_NAME_TOO_LONG',
            { firstName, length: firstName.length }
        );
    }
}

/**
 * Validates profile last name
 * @param lastName - The last name to validate
 * @throws ProfileValidationError if validation fails
 */
export function validateLastName(lastName: string): void {
    if (!lastName || lastName.length < 1) {
        throw new ProfileValidationError(
            'Last name is required',
            'LAST_NAME_REQUIRED',
            { lastName }
        );
    }

    if (lastName.length > 50) {
        throw new ProfileValidationError(
            'Last name cannot exceed 50 characters',
            'LAST_NAME_TOO_LONG',
            { lastName, length: lastName.length }
        );
    }
}

/**
 * Validates profile phone number
 * @param phone - The phone number to validate
 * @throws ProfileValidationError if validation fails
 */
export function validatePhone(phone: string): void {
    if (phone && phone.length > 20) {
        throw new ProfileValidationError(
            'Phone number cannot exceed 20 characters',
            'PHONE_TOO_LONG',
            { phone, length: phone.length }
        );
    }
}

/**
 * Validates profile date of birth
 * @param dob - The date of birth to validate
 * @throws ProfileValidationError if validation fails
 */
export function validateDateOfBirth(dob: string): void {
    if (dob) {
        const date = new Date(dob);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();

        if (isNaN(date.getTime())) {
            throw new ProfileValidationError(
                'Invalid date of birth',
                'INVALID_DOB',
                { dob }
            );
        }

        if (age < 16) {
            throw new ProfileValidationError(
                'User must be at least 16 years old',
                'DOB_TOO_YOUNG',
                { dob, age }
            );
        }

        if (age > 120) {
            throw new ProfileValidationError(
                'Invalid date of birth',
                'DOB_TOO_OLD',
                { dob, age }
            );
        }
    }
}

/**
 * Validates profile data
 * @param data - The profile data to validate
 * @returns ValidationResult
 */
export function validateProfileData(data: ProfileCreateData | ProfileUpdateData) {
    try {
        validateFirstName(data?.full_name?.split(' ')[0] ?? '');
        validateLastName(data?.full_name?.split(' ')[0] ?? '');
        if (data.phone) {
            validatePhone(data.phone);
        }

        return { success: true };
    } catch (error) {
        if (error instanceof ProfileValidationError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                details: error.details
            };
        }
        return {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR'
        };
    }
}

/**
 * Profile constraint checking utilities
 */

/**
 * Checks if a profile can be deleted
 * @param id - The profile ID to check
 * @returns Object with canDelete flag
 */
export async function checkProfileConstraints(id: string): Promise<ProfileConstraintCheck> {
    try {
        // For now, we allow deletion of any profile
        // This could be extended with business rules if needed
        return {
            canDelete: true
        };
    } catch (error) {
        console.error('Error checking profile constraints:', error);
        // In case of error, assume it cannot be deleted for safety
        return {
            canDelete: false
        };
    }
}

/**
 * Business rule enforcement utilities
 */

/**
 * Formats a full name from first and last name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted full name
 */
export function formatFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
}

/**
 * Calculates age from date of birth
 * @param dob - Date of birth
 * @returns Age in years
 */
export function calculateAge(dob: string): number {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}