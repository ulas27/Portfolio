import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    errors: ['rate<0.1'],             // Custom error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Test homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test shop page
  response = http.get(`${BASE_URL}/shop`);
  check(response, {
    'shop page status is 200': (r) => r.status === 200,
    'shop page response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test product search
  response = http.get(`${BASE_URL}/shop/search?q=test`);
  check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 800ms': (r) => r.timings.duration < 800,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test product detail page
  response = http.get(`${BASE_URL}/shop/product/1`);
  check(response, {
    'product detail status is 200': (r) => r.status === 200,
    'product detail response time < 600ms': (r) => r.timings.duration < 600,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test cart operations
  response = http.post(`${BASE_URL}/cart/add`, {
    product_id: '1',
    quantity: '1'
  });
  check(response, {
    'add to cart status is 200': (r) => r.status === 200,
    'add to cart response time < 300ms': (r) => r.timings.duration < 300,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test cart view
  response = http.get(`${BASE_URL}/cart`);
  check(response, {
    'cart view status is 200': (r) => r.status === 200,
    'cart view response time < 400ms': (r) => r.timings.duration < 400,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test checkout page
  response = http.get(`${BASE_URL}/cart/checkout`);
  check(response, {
    'checkout status is 200': (r) => r.status === 200,
    'checkout response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test about page
  response = http.get(`${BASE_URL}/about`);
  check(response, {
    'about page status is 200': (r) => r.status === 200,
    'about page response time < 300ms': (r) => r.timings.duration < 300,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test contact page
  response = http.get(`${BASE_URL}/contact`);
  check(response, {
    'contact page status is 200': (r) => r.status === 200,
    'contact page response time < 300ms': (r) => r.timings.duration < 300,
  });
  errorRate.add(response.status !== 200);
  sleep(1);

  // Test health endpoint
  response = http.get(`${BASE_URL}/health`);
  check(response, {
    'health endpoint status is 200': (r) => r.status === 200,
    'health endpoint response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(response.status !== 200);
  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================
    Performance Test Results
    ========================
    
    Total Requests: ${data.metrics.http_reqs.values.count}
    Failed Requests: ${data.metrics.http_req_failed.values.count}
    Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
    
    Response Times:
    - Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
    - Median: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms
    - 95th percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
    - 99th percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
    
    Requests per second: ${data.metrics.http_reqs.values.rate.toFixed(2)}
    
    Test Status: ${data.metrics.http_req_failed.values.rate < 0.1 ? 'PASSED' : 'FAILED'}
    `,
  };
}
