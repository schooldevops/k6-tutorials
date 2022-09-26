import http from 'k6/http';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors 가 1% 이하이어야함
    http_req_duration: ['p(95)<200'], // 요청의 95% 가 200ms 이하 이어야함
  },
};

export default function () {
  http.get('https://test-api.k6.io/public/crocodiles/1/');
}
