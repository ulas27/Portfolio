import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const slowRequestRate = new Rate('slow_requests');

// Stress test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 500 },  // Ramp up to 500 users
    { duration: '3m', target: 1000 }, // Ramp up to 1000 users
    { duration: '10m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.05'],             // Custom error rate must be below 5%
    slow_requests: ['rate<0.1'],       // Slow requests must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Test critical user journeys under stress
  
  // 1. Homepage load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage loads under stress': (r) => r.status === 200,
    'homepage response time acceptable': (r) => r.timings.duration < 2000,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 1000);
  sleep(0.5);

  // 2. Shop page with heavy load
  response = http.get(`${BASE_URL}/shop`);
  check(response, {
    'shop page loads under stress': (r) => r.status === 200,
    'shop page response time acceptable': (r) => r.timings.duration < 3000,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 1500);
  sleep(0.3);

  // 3. Product search under load
  const searchTerms = ['altın', 'gümüş', 'yüzük', 'kolye', 'bilezik'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  response = http.get(`${BASE_URL}/shop/search?q=${randomTerm}`);
  check(response, {
    'search works under stress': (r) => r.status === 200,
    'search response time acceptable': (r) => r.timings.duration < 2000,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 1000);
  sleep(0.2);

  // 4. Product detail page
  const productId = Math.floor(Math.random() * 10) + 1;
  response = http.get(`${BASE_URL}/shop/product/${productId}`);
  check(response, {
    'product detail loads under stress': (r) => r.status === 200,
    'product detail response time acceptable': (r) => r.timings.duration < 1500,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 800);
  sleep(0.1);

  // 5. Cart operations under stress
  response = http.post(`${BASE_URL}/cart/add`, {
    product_id: productId.toString(),
    quantity: '1'
  });
  check(response, {
    'cart add works under stress': (r) => r.status === 200,
    'cart add response time acceptable': (r) => r.timings.duration < 1000,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 500);
  sleep(0.1);

  // 6. Cart view under stress
  response = http.get(`${BASE_URL}/cart`);
  check(response, {
    'cart view works under stress': (r) => r.status === 200,
    'cart view response time acceptable': (r) => r.timings.duration < 1000,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 500);
  sleep(0.1);

  // 7. Checkout page under stress
  response = http.get(`${BASE_URL}/cart/checkout`);
  check(response, {
    'checkout page loads under stress': (r) => r.status === 200,
    'checkout response time acceptable': (r) => r.timings.duration < 1500,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 800);
  sleep(0.2);

  // 8. Static assets under stress
  response = http.get(`${BASE_URL}/static/css/main.css`);
  check(response, {
    'CSS loads under stress': (r) => r.status === 200,
    'CSS response time acceptable': (r) => r.timings.duration < 500,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 200);
  sleep(0.1);

  // 9. JavaScript assets under stress
  response = http.get(`${BASE_URL}/static/js/main.js`);
  check(response, {
    'JS loads under stress': (r) => r.status === 200,
    'JS response time acceptable': (r) => r.timings.duration < 500,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 200);
  sleep(0.1);

  // 10. Health check under stress
  response = http.get(`${BASE_URL}/health`);
  check(response, {
    'health check works under stress': (r) => r.status === 200,
    'health check response time acceptable': (r) => r.timings.duration < 200,
  });
  errorRate.add(response.status !== 200);
  slowRequestRate.add(response.timings.duration > 100);
  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'stress-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================
    Stress Test Results
    ========================
    
    Test Configuration:
    - Maximum Users: 1000
    - Test Duration: 26 minutes
    - Ramp-up Strategy: Gradual increase
    
    Performance Metrics:
    - Total Requests: ${data.metrics.http_reqs.values.count}
    - Failed Requests: ${data.metrics.http_req_failed.values.count}
    - Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
    - Slow Request Rate: ${(data.metrics.slow_requests.values.rate * 100).toFixed(2)}%
    
    Response Times:
    - Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
    - Median: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms
    - 95th percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
    - 99th percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
    - Maximum: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
    
    Throughput:
    - Requests per second: ${data.metrics.http_reqs.values.rate.toFixed(2)}
    - Data received: ${(data.metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB
    - Data sent: ${(data.metrics.data_sent.values.count / 1024 / 1024).toFixed(2)} MB
    
    Test Status: ${data.metrics.http_req_failed.values.rate < 0.05 ? 'PASSED' : 'FAILED'}
    
    Recommendations:
    ${data.metrics.http_req_failed.values.rate > 0.05 ? '- High error rate detected. Check server resources and database connections.' : ''}
    ${data.metrics.http_req_duration.values['p(95)'] > 2000 ? '- High response times detected. Consider caching and database optimization.' : ''}
    ${data.metrics.slow_requests.values.rate > 0.1 ? '- High slow request rate. Check for performance bottlenecks.' : ''}
    `,
  };
}
