// API Test Script - test-api.js
// Run with: node test-api.js

const baseURL = 'http://localhost:4000/api';

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function testAPI(method, endpoint, data = null, expectStatus = 200) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseURL}${endpoint}`, options);
    const responseData = await response.json();

    const passed = response.status === expectStatus || (response.ok && expectStatus === 200);
    
    if (passed) {
      console.log(`${colors.green}✓ PASS${colors.reset} ${method} ${endpoint} (${response.status})`);
      testResults.passed++;
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} ${method} ${endpoint} (Expected ${expectStatus}, got ${response.status})`);
      testResults.failed++;
      testResults.errors.push(`${method} ${endpoint}: ${response.status}`);
    }

    return { status: response.status, data: responseData };
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset} ${method} ${endpoint}: ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`${method} ${endpoint}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log(`${colors.blue}🧪 Recipe Sharing App - API Tests${colors.reset}\n`);

  // Test 1: Get all recipes (public)
  console.log(`${colors.yellow}• Testing Recipe Endpoints${colors.reset}`);
  await testAPI('GET', '/recipes');
  
  // Test 2: Get trending recipes (public)
  await testAPI('GET', '/recipes/trending');

  // Test 3: Invalid recipe ID (should fail 404)
  await testAPI('GET', '/recipes/invalid123', null, 404);

  // Test 4: Register user
  console.log(`\n${colors.yellow}• Testing Auth Endpoints${colors.reset}`);
  const registerData = {
    name: `TestUser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  const registerRes = await testAPI('POST', '/auth/register', registerData, 201);
  let token = registerRes?.data?.token;

  // Test 5: Login as that user
  const loginRes = await testAPI('POST', '/auth/login', {
    email: registerData.email,
    password: registerData.password
  });
  if (loginRes?.data?.token) {
    token = loginRes.data.token;
    console.log(`${colors.green}→ Got auth token${colors.reset}`);
  }

  // Test 6: Protected endpoint without token (should fail 401)
  console.log(`\n${colors.yellow}• Testing Protected Endpoints${colors.reset}`);
  await testAPI('POST', '/recipes', 
    { title: 'Test', description: 'Test' }, 
    401
  );

  // Test 7: Create recipe with token
  if (token) {
    const createData = {
      title: `Test Recipe ${Date.now()}`,
      description: 'This is a test recipe',
      difficulty: 'easy',
      prepTime: 30,
      servings: 4,
      ingredients: 'Flour, sugar, eggs',
      instructions: 'Mix all ingredients'
    };

    const response = await fetch(`${baseURL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(createData)
    });

    if (response.ok) {
      const recipe = await response.json();
      console.log(`${colors.green}✓ PASS${colors.reset} POST /recipes (201) - Recipe created`);
      testResults.passed++;

      const recipeId = recipe.data?._id || recipe._id;

      // Test 8: Like recipe (protected)
      if (recipeId) {
        const likeResponse = await fetch(`${baseURL}/recipes/${recipeId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (likeResponse.ok) {
          console.log(`${colors.green}✓ PASS${colors.reset} POST /recipes/:id/like (200)`);
          testResults.passed++;
        } else {
          console.log(`${colors.red}✗ FAIL${colors.reset} POST /recipes/:id/like (${likeResponse.status})`);
          testResults.failed++;
        }

        // Test 9: Favorite recipe (protected)
        const favoriteResponse = await fetch(`${baseURL}/recipes/${recipeId}/favorite`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (favoriteResponse.ok) {
          console.log(`${colors.green}✓ PASS${colors.reset} POST /recipes/:id/favorite (200)`);
          testResults.passed++;
        } else {
          console.log(`${colors.red}✗ FAIL${colors.reset} POST /recipes/:id/favorite (${favoriteResponse.status})`);
          testResults.failed++;
        }
      }
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} POST /recipes (${response.status})`);
      testResults.failed++;
    }
  }

  // Summary
  console.log(`\n${colors.blue}📊 Test Results:${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);

  if (testResults.errors.length > 0) {
    console.log(`\n${colors.yellow}Errors:${colors.reset}`);
    testResults.errors.forEach(err => console.log(`  - ${err}`));
  }

  if (testResults.failed === 0) {
    console.log(`\n${colors.green}✅ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed!${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, err);
  process.exit(1);
});
