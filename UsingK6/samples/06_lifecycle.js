
import http from 'k6/http';

export const options = {
  vus: 10,
  duration: '30s',
};

export function setup() {
  const res = http.get('https://httpbin.test.k6.io/get');
  console.log("Setup: 01");
  return { data: res.json() };
}

export function teardown(data) {
  console.log("Function teardown");
  console.log(JSON.stringify(data));
}

export default function (data) {
  console.log("Function default");
  console.log(JSON.stringify(data));
}