import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 2,
  duration: "5s"
}

export default function() {
  let result = http.get(`https://test-api.k6.io/`);

  check(result, {
    "Status is 200": (r) => r.status === 200,
    "Duration < 500ms": (r) => r.timings.duration < 500
  });

  sleep(1);
}

/**
k6 run 03-VUsDurationChecks.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 03-VUsDurationChecks.js
     output: -

  scenarios: (100.00%) 1 scenario, 2 max VUs, 35s max duration (incl. graceful stop):
           * default: 2 looping VUs for 5s (gracefulStop: 30s)


running (05.9s), 0/2 VUs, 8 complete and 0 interrupted iterations
default ✓ [======================================] 2 VUs  5s

     ✓ Status is 200
     ✓ Duration < 500ms

     checks.........................: 100.00% ✓ 16       ✗ 0  
     data_received..................: 138 kB  24 kB/s
     data_sent......................: 1.5 kB  256 B/s
     http_req_blocked...............: avg=107.75ms min=2µs      med=5.5µs    max=431.81ms p(90)=430.68ms p(95)=431.24ms
     http_req_connecting............: avg=50.13ms  min=0s       med=0s       max=200.56ms p(90)=200.52ms p(95)=200.54ms
     http_req_duration..............: avg=357.71ms min=206.21ms med=406.5ms  max=410.36ms p(90)=410.09ms p(95)=410.22ms
       { expected_response:true }...: avg=357.71ms min=206.21ms med=406.5ms  max=410.36ms p(90)=410.09ms p(95)=410.22ms
     http_req_failed................: 0.00%   ✓ 0        ✗ 8  
     http_req_receiving.............: avg=100.39ms min=24µs     med=99.45ms  max=203.88ms p(90)=201.25ms p(95)=202.56ms
     http_req_sending...............: avg=20.62µs  min=8µs      med=22µs     max=31µs     p(90)=28.9µs   p(95)=29.94µs 
     http_req_tls_handshaking.......: avg=53.99ms  min=0s       med=0s       max=216.67ms p(90)=215.69ms p(95)=216.18ms
     http_req_waiting...............: avg=257.3ms  min=205.94ms med=208.04ms max=406.48ms p(90)=406.02ms p(95)=406.25ms
     http_reqs......................: 8       1.363236/s
     iteration_duration.............: avg=1.46s    min=1.4s     med=1.41s    max=1.63s    p(90)=1.63s    p(95)=1.63s   
     iterations.....................: 8       1.363236/s
     vus............................: 2       min=2      max=2
     vus_max........................: 2       min=2      max=2
 */