import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      preAllocatedVUs: 100,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '10s', target: 10 },   
      ],
    },
  },
};

export default function () {
  http.get('https://test.k6.io/contacts.php');

  sleep(5);
}

/**
k6 run 08-OpenVsClosed-Executors-Open.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 08-OpenVsClosed-Executors-Open.js
     output: -

  scenarios: (100.00%) 1 scenario, 100 max VUs, 50s max duration (incl. graceful stop):
           * contacts: Up to 10.00 iterations/s for 20s over 2 stages (maxVUs: 100, gracefulStop: 30s)


running (25.1s), 000/100 VUs, 124 complete and 0 interrupted iterations
contacts ✓ [======================================] 000/100 VUs  20s  09.97 iters/s

     data_received..................: 634 kB 25 kB/s
     data_sent......................: 48 kB  1.9 kB/s
     http_req_blocked...............: avg=323.34ms min=2µs      med=393.54ms max=594.19ms p(90)=414.87ms p(95)=421.12ms
     http_req_connecting............: avg=158.42ms min=0s       med=193.44ms max=216.2ms  p(90)=204.28ms p(95)=206.81ms
     http_req_duration..............: avg=198.96ms min=186.52ms med=198.74ms max=215.21ms p(90)=206.83ms p(95)=209.53ms
       { expected_response:true }...: avg=198.96ms min=186.52ms med=198.74ms max=215.21ms p(90)=206.83ms p(95)=209.53ms
     http_req_failed................: 0.00%  ✓ 0       ✗ 124  
     http_req_receiving.............: avg=75.99µs  min=20µs     med=75.5µs   max=533µs    p(90)=106.4µs  p(95)=123.85µs
     http_req_sending...............: avg=23.12µs  min=9µs      med=22µs     max=60µs     p(90)=30.4µs   p(95)=35µs    
     http_req_tls_handshaking.......: avg=163.62ms min=0s       med=200.04ms max=230.97ms p(90)=210.67ms p(95)=214.59ms
     http_req_waiting...............: avg=198.86ms min=186.43ms med=198.68ms max=215.17ms p(90)=206.71ms p(95)=209.44ms
     http_reqs......................: 124    4.93922/s
     iteration_duration.............: avg=5.52s    min=5.18s    med=5.59s    max=5.81s    p(90)=5.62s    p(95)=5.63s   
     iterations.....................: 124    4.93922/s
     vus............................: 100    min=100   max=100
     vus_max........................: 100    min=100   max=100

 */