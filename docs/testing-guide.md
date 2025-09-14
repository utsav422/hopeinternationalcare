# User Deletion System Testing Guide

This document provides comprehensive information about testing the user deletion management system.

## Test Structure

### Test Categories

#### 1. Unit Tests
- **Location**: `__tests__/server-actions/`, `__tests__/hooks/`
- **Purpose**: Test individual functions and hooks in isolation
- **Framework**: Vitest
- **Coverage**: Server actions, custom hooks, utility functions

#### 2. Component Tests
- **Location**: `__tests__/components/`
- **Purpose**: Test React components with user interactions
- **Framework**: Vitest + React Testing Library
- **Coverage**: UI components, forms, modals

#### 3. Integration Tests
- **Location**: `__tests__/integration/`
- **Purpose**: Test complete workflows and data flow
- **Framework**: Vitest
- **Coverage**: End-to-end user deletion workflows

#### 4. End-to-End Tests
- **Location**: `__tests__/e2e/`
- **Purpose**: Test complete user journeys in browser
- **Framework**: Playwright
- **Coverage**: Full application workflows, UI interactions

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Unit and Component Tests
```bash
# Run all unit and component tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test __tests__/hooks/user-deletion.test.tsx

# Run tests matching pattern
npm run test -- --grep "deletion"
```

### Integration Tests
```bash
# Run integration tests only
npm run test __tests__/integration/

# Run with verbose output
npm run test __tests__/integration/ -- --reporter=verbose
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (visible browser)
npm run test:e2e -- --headed

# Run specific E2E test
npm run test:e2e __tests__/e2e/user-deletion.spec.ts

# Run E2E tests on specific browser
npm run test:e2e -- --project=chromium
```

### System Validation
```bash
# Run comprehensive system validation
npm run validate:system

# This script checks:
# - Database schema
# - Server actions
# - Custom hooks
# - UI components
# - Routing
# - TypeScript compilation
# - Build process
```

## Test Configuration

### Environment Variables
Create a `.env.test` file for test-specific configuration:

```env
# Test database (use a separate test database)
DATABASE_URL=postgresql://user:password@localhost:5432/hope_international_test

# Test admin credentials
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=testpassword123

# Test application URL
TEST_BASE_URL=http://localhost:3000

# Test-specific settings
NEXT_PUBLIC_MAX_USER_RESTORATIONS=3
```

### Test Database Setup
1. Create a separate test database
2. Run migrations: `npm run db:migrate`
3. Seed with test data: `npm run db:seed:test`

## Test Data Management

### Mock Data
Tests use mock data generators from `__tests__/setup/test-config.ts`:

```typescript
// Create mock user
const user = createMockUser({
  id: 'test-user-123',
  email: 'test@example.com',
  full_name: 'Test User'
});

// Create mock deleted user
const deletedUser = createMockDeletedUser({
  deletion_count: 1,
  deletion_reason: 'Test deletion'
});
```

### Test Utilities
Common test utilities are available:

```typescript
import { 
  expectSuccessResponse,
  expectErrorResponse,
  expectValidPagination,
  measureExecutionTime 
} from '__tests__/setup/test-config';

// Validate server action response
expectSuccessResponse(result);

// Validate error response
expectErrorResponse(result, 'User not found');

// Validate pagination data
expectValidPagination(data.pagination);
```

## Test Coverage Requirements

### Minimum Coverage Thresholds
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Critical Components (100% Coverage Required)
- Server actions (`lib/server-actions/admin/user-deletion.ts`)
- Core hooks (`hooks/admin/user-deletion.ts`)
- Form validation logic
- Permission checking functions

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

## Testing Best Practices

### 1. Test Structure
```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### 2. Mock Management
- Use `vi.mock()` for external dependencies
- Clear mocks between tests with `vi.clearAllMocks()`
- Restore mocks after tests with `vi.restoreAllMocks()`

### 3. Async Testing
```typescript
// For async operations
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// For React hooks
await waitFor(() => {
  expect(result.current.isSuccess).toBe(true);
});
```

### 4. Error Testing
```typescript
// Test error conditions
it('should handle errors gracefully', async () => {
  mockFunction.mockRejectedValue(new Error('Test error'));
  
  const result = await functionUnderTest();
  
  expect(result.success).toBe(false);
  expect(result.message).toContain('Test error');
});
```

## Debugging Tests

### Debug Unit Tests
```bash
# Run tests with debug output
npm run test -- --reporter=verbose

# Run single test with debugging
npm run test -- --grep "specific test name" --reporter=verbose
```

### Debug E2E Tests
```bash
# Run with browser visible
npm run test:e2e -- --headed

# Run with debug mode
npm run test:e2e -- --debug

# Generate trace for failed tests
npm run test:e2e -- --trace=on
```

### Debug Tools
- **Vitest UI**: `npm run test:ui` - Visual test runner
- **Playwright Inspector**: `npx playwright test --debug`
- **Browser DevTools**: Available in headed mode

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled runs (daily)

### Test Pipeline
1. **Lint and Type Check**: ESLint + TypeScript
2. **Unit Tests**: Vitest with coverage
3. **Build Test**: Next.js build
4. **E2E Tests**: Playwright across browsers
5. **System Validation**: Custom validation script

### Failure Handling
- Tests must pass before merging
- Coverage thresholds must be met
- E2E tests must pass on all browsers
- System validation must complete successfully

## Performance Testing

### Load Testing
```typescript
// Test performance of server actions
it('should handle deletion within performance threshold', async () => {
  const { result, executionTime } = await measureExecutionTime(
    () => softDeleteUserAction(formData)
  );
  
  expectPerformanceThreshold(executionTime, 1000); // 1 second max
});
```

### Memory Testing
- Monitor memory usage during bulk operations
- Test for memory leaks in long-running operations
- Validate cleanup after operations

## Security Testing

### Input Validation
- Test SQL injection prevention
- Test XSS prevention
- Test CSRF protection
- Test authorization checks

### Permission Testing
```typescript
// Test role-based access
it('should prevent non-admin access', async () => {
  mockRequireAdmin.mockRejectedValue(new Error('Unauthorized'));
  
  const result = await softDeleteUserAction(formData);
  
  expect(result.success).toBe(false);
});
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Ensure test database is running
- Check connection string in `.env.test`
- Verify database permissions

#### 2. Mock Issues
- Clear mocks between tests
- Verify mock implementations
- Check mock call counts

#### 3. Async Test Failures
- Use proper `await` keywords
- Set appropriate timeouts
- Handle promise rejections

#### 4. E2E Test Flakiness
- Add proper wait conditions
- Use stable selectors
- Handle loading states

### Getting Help
- Check test logs for detailed error messages
- Use debug mode for step-by-step execution
- Review test documentation and examples
- Ask team members for assistance

## Test Maintenance

### Regular Tasks
- Update test data when schema changes
- Refresh mock implementations
- Review and update coverage thresholds
- Clean up obsolete tests

### When Adding New Features
1. Write tests before implementation (TDD)
2. Ensure adequate test coverage
3. Update integration tests
4. Add E2E test scenarios
5. Update documentation
