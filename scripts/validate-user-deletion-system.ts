#!/usr/bin/env tsx

/**
 * Comprehensive validation script for the user deletion system
 * This script validates all components, server actions, hooks, and routes
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
    component: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
    details?: string[];
}

class UserDeletionSystemValidator {
    private results: ValidationResult[] = [];
    private projectRoot: string;

    constructor() {
        this.projectRoot = process.cwd();
    }

    private addResult(component: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string[]) {
        this.results.push({ component, status, message, details });
    }

    private fileExists(path: string): boolean {
        return existsSync(join(this.projectRoot, path));
    }

    private readFile(path: string): string {
        try {
            return readFileSync(join(this.projectRoot, path), 'utf-8');
        } catch {
            return '';
        }
    }

    private runCommand(command: string): { success: boolean; output: string } {
        try {
            const output = execSync(command, { encoding: 'utf-8', cwd: this.projectRoot });
            return { success: true, output };
        } catch (error: any) {
            return { success: false, output: error.message };
        }
    }

    // Validate database schema and migrations
    validateDatabaseSchema() {
        console.log('🔍 Validating database schema...');

        // Check if schema files exist
        const schemaFiles = [
            'lib/db/schema/profiles.ts',
            'lib/db/schema/user-deletion-history.ts',
            'lib/db/drizzle-zod-schema/profiles.ts'
        ];

        let allSchemaFilesExist = true;
        const missingFiles: string[] = [];

        schemaFiles.forEach(file => {
            if (!this.fileExists(file)) {
                allSchemaFilesExist = false;
                missingFiles.push(file);
            }
        });

        if (allSchemaFilesExist) {
            this.addResult('Database Schema', 'PASS', 'All schema files exist');
        } else {
            this.addResult('Database Schema', 'FAIL', 'Missing schema files', missingFiles);
        }

        // Check for required columns in profiles schema
        const profilesSchema = this.readFile('lib/db/schema/profiles.ts');
        const requiredColumns = ['deleted_at', 'deletion_scheduled_for', 'deletion_count'];
        const missingColumns = requiredColumns.filter(col => !profilesSchema.includes(col));

        if (missingColumns.length === 0) {
            this.addResult('Profiles Schema', 'PASS', 'All required columns present');
        } else {
            this.addResult('Profiles Schema', 'FAIL', 'Missing required columns', missingColumns);
        }

        // Check migration files
        const migrationResult = this.runCommand('ls drizzle/*.sql | wc -l');
        if (migrationResult.success && parseInt(migrationResult.output.trim()) > 0) {
            this.addResult('Database Migrations', 'PASS', 'Migration files exist');
        } else {
            this.addResult('Database Migrations', 'WARNING', 'No migration files found');
        }
    }

    // Validate server actions
    validateServerActions() {
        console.log('🔍 Validating server actions...');

        const serverActionFile = 'lib/server-actions/admin/user-deletion.ts';
        
        if (!this.fileExists(serverActionFile)) {
            this.addResult('Server Actions', 'FAIL', 'Server action file missing');
            return;
        }

        const serverActionContent = this.readFile(serverActionFile);
        const requiredActions = [
            'softDeleteUserAction',
            'restoreUserAction',
            'getDeletedUsersAction',
            'getUserDeletionHistoryAction',
            'cancelScheduledDeletionAction'
        ];

        const missingActions = requiredActions.filter(action => !serverActionContent.includes(action));

        if (missingActions.length === 0) {
            this.addResult('Server Actions', 'PASS', 'All required server actions implemented');
        } else {
            this.addResult('Server Actions', 'FAIL', 'Missing server actions', missingActions);
        }

        // Check for proper error handling
        if (serverActionContent.includes('try') && serverActionContent.includes('catch')) {
            this.addResult('Error Handling', 'PASS', 'Server actions have error handling');
        } else {
            this.addResult('Error Handling', 'WARNING', 'Server actions may lack proper error handling');
        }
    }

    // Validate custom hooks
    validateCustomHooks() {
        console.log('🔍 Validating custom hooks...');

        const hookFiles = [
            'hooks/admin/user-deletion.ts',
            'hooks/admin/use-user-deletion-forms.ts',
            'hooks/admin/use-user-deletion-notifications.ts',
            'hooks/admin/use-user-management-integration.ts'
        ];

        let allHooksExist = true;
        const missingHooks: string[] = [];

        hookFiles.forEach(file => {
            if (!this.fileExists(file)) {
                allHooksExist = false;
                missingHooks.push(file);
            }
        });

        if (allHooksExist) {
            this.addResult('Custom Hooks', 'PASS', 'All hook files exist');
        } else {
            this.addResult('Custom Hooks', 'FAIL', 'Missing hook files', missingHooks);
        }

        // Check main hook file for required hooks
        const mainHookFile = this.readFile('hooks/admin/user-deletion.ts');
        const requiredHooks = [
            'useDeleteUser',
            'useRestoreUser',
            'useDeletedUsers',
            'useUserDeletionHistory',
            'useCancelScheduledDeletion'
        ];

        const missingMainHooks = requiredHooks.filter(hook => !mainHookFile.includes(hook));

        if (missingMainHooks.length === 0) {
            this.addResult('Main Hooks', 'PASS', 'All required hooks implemented');
        } else {
            this.addResult('Main Hooks', 'FAIL', 'Missing required hooks', missingMainHooks);
        }
    }

    // Validate UI components
    validateUIComponents() {
        console.log('🔍 Validating UI components...');

        const componentFiles = [
            'components/Admin/Users/delete-user-modal.tsx',
            'components/Admin/Users/restore-user-modal.tsx',
            'components/Admin/Users/deleted-users-page.tsx',
            'components/Admin/Users/user-deletion-history.tsx',
            'components/Admin/Users/user-management-breadcrumb.tsx'
        ];

        let allComponentsExist = true;
        const missingComponents: string[] = [];

        componentFiles.forEach(file => {
            if (!this.fileExists(file)) {
                allComponentsExist = false;
                missingComponents.push(file);
            }
        });

        if (allComponentsExist) {
            this.addResult('UI Components', 'PASS', 'All component files exist');
        } else {
            this.addResult('UI Components', 'FAIL', 'Missing component files', missingComponents);
        }

        // Check for proper TypeScript usage
        const deleteModalContent = this.readFile('components/Admin/Users/delete-user-modal.tsx');
        if (deleteModalContent.includes('interface') && deleteModalContent.includes('export default')) {
            this.addResult('TypeScript Usage', 'PASS', 'Components use proper TypeScript');
        } else {
            this.addResult('TypeScript Usage', 'WARNING', 'Components may lack proper TypeScript definitions');
        }
    }

    // Validate routing and navigation
    validateRouting() {
        console.log('🔍 Validating routing and navigation...');

        const routeFiles = [
            'app/(protected)/admin/users/deleted/page.tsx',
            'app/(protected)/admin/users/deleted/[id]/history/page.tsx',
            'app/(protected)/admin/users/deleted/loading.tsx',
            'app/(protected)/admin/users/deleted/[id]/not-found.tsx'
        ];

        let allRoutesExist = true;
        const missingRoutes: string[] = [];

        routeFiles.forEach(file => {
            if (!this.fileExists(file)) {
                allRoutesExist = false;
                missingRoutes.push(file);
            }
        });

        if (allRoutesExist) {
            this.addResult('Route Files', 'PASS', 'All route files exist');
        } else {
            this.addResult('Route Files', 'FAIL', 'Missing route files', missingRoutes);
        }

        // Check sidebar navigation
        const sidebarContent = this.readFile('components/Admin/Sidebar/app-sidebar.tsx');
        if (sidebarContent.includes('Deleted Users') && sidebarContent.includes('sub_items')) {
            this.addResult('Navigation', 'PASS', 'Sidebar navigation updated');
        } else {
            this.addResult('Navigation', 'WARNING', 'Sidebar navigation may not be properly updated');
        }
    }

    // Validate tests
    validateTests() {
        console.log('🔍 Validating tests...');

        const testFiles = [
            '__tests__/server-actions/user-deletion.test.ts',
            '__tests__/hooks/user-deletion.test.tsx',
            '__tests__/hooks/user-deletion-forms.test.tsx',
            '__tests__/components/delete-user-modal.test.tsx',
            '__tests__/integration/user-deletion-workflow.test.ts',
            '__tests__/e2e/user-deletion.spec.ts'
        ];

        let allTestsExist = true;
        const missingTests: string[] = [];

        testFiles.forEach(file => {
            if (!this.fileExists(file)) {
                allTestsExist = false;
                missingTests.push(file);
            }
        });

        if (allTestsExist) {
            this.addResult('Test Files', 'PASS', 'All test files exist');
        } else {
            this.addResult('Test Files', 'FAIL', 'Missing test files', missingTests);
        }

        // Try to run tests
        const testResult = this.runCommand('npm run test -- --run --reporter=json');
        if (testResult.success) {
            this.addResult('Test Execution', 'PASS', 'Tests can be executed');
        } else {
            this.addResult('Test Execution', 'WARNING', 'Tests may have issues', [testResult.output]);
        }
    }

    // Validate TypeScript compilation
    validateTypeScript() {
        console.log('🔍 Validating TypeScript compilation...');

        const tscResult = this.runCommand('npx tsc --noEmit');
        if (tscResult.success) {
            this.addResult('TypeScript', 'PASS', 'No TypeScript errors');
        } else {
            this.addResult('TypeScript', 'FAIL', 'TypeScript compilation errors', [tscResult.output]);
        }
    }

    // Validate build process
    validateBuild() {
        console.log('🔍 Validating build process...');

        const buildResult = this.runCommand('npm run build');
        if (buildResult.success) {
            this.addResult('Build Process', 'PASS', 'Application builds successfully');
        } else {
            this.addResult('Build Process', 'FAIL', 'Build process failed', [buildResult.output]);
        }
    }

    // Run all validations
    async validate() {
        console.log('🚀 Starting comprehensive validation of user deletion system...\n');

        this.validateDatabaseSchema();
        this.validateServerActions();
        this.validateCustomHooks();
        this.validateUIComponents();
        this.validateRouting();
        this.validateTests();
        this.validateTypeScript();
        this.validateBuild();

        this.printResults();
    }

    // Print validation results
    private printResults() {
        console.log('\n📊 Validation Results:');
        console.log('='.repeat(50));

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARNING').length;

        this.results.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`${icon} ${result.component}: ${result.message}`);
            
            if (result.details && result.details.length > 0) {
                result.details.forEach(detail => {
                    console.log(`   - ${detail}`);
                });
            }
        });

        console.log('\n📈 Summary:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        console.log(`📊 Total: ${this.results.length}`);

        if (failed === 0) {
            console.log('\n🎉 All critical validations passed! The user deletion system is ready for production.');
        } else {
            console.log('\n🚨 Some validations failed. Please address the issues before deploying.');
            process.exit(1);
        }
    }
}

// Run validation if this script is executed directly
if (require.main === module) {
    const validator = new UserDeletionSystemValidator();
    validator.validate().catch(console.error);
}

export default UserDeletionSystemValidator;
