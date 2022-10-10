import http from 'k6/http';
import { sleep } from 'k6';

export function setup() {
  console.log('1. setup');
}

export default function(data) {
  console.log('2. VU code.');
  let result = http.get(`https://test-api.k6.io/`);
  sleep(1)
}

export function teardown(data) {
  console.log('3. Teardown Code.');
}

/**
k6 run 02-lifetime.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 02-lifetime.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 1 iterations for each of 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)

INFO[0000] 1. setup                                      source=console
INFO[0000] 2. VU code.                                   source=console
INFO[0002] 3. Teardown Code.                             source=console

running (00m01.8s), 0/1 VUs, 1 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m01.8s/10m0s  1/1 iters, 1 per VU

     █ setup

     █ teardown

     data_received..................: 21 kB 12 kB/s
     data_sent......................: 446 B 246 B/s
     http_req_blocked...............: avg=600.04ms min=600.04ms med=600.04ms max=600.04ms p(90)=600.04ms p(95)=600.04ms
     http_req_connecting............: avg=199.33ms min=199.33ms med=199.33ms max=199.33ms p(90)=199.33ms p(95)=199.33ms
     http_req_duration..............: avg=207.11ms min=207.11ms med=207.11ms max=207.11ms p(90)=207.11ms p(95)=207.11ms
       { expected_response:true }...: avg=207.11ms min=207.11ms med=207.11ms max=207.11ms p(90)=207.11ms p(95)=207.11ms
     http_req_failed................: 0.00% ✓ 0        ✗ 1  
     http_req_receiving.............: avg=74µs     min=74µs     med=74µs     max=74µs     p(90)=74µs     p(95)=74µs    
     http_req_sending...............: avg=366µs    min=366µs    med=366µs    max=366µs    p(90)=366µs    p(95)=366µs   
     http_req_tls_handshaking.......: avg=216.46ms min=216.46ms med=216.46ms max=216.46ms p(90)=216.46ms p(95)=216.46ms
     http_req_waiting...............: avg=206.67ms min=206.67ms med=206.67ms max=206.67ms p(90)=206.67ms p(95)=206.67ms
     http_reqs......................: 1     0.551421/s
     iteration_duration.............: avg=603.6ms  min=62.79µs  med=488.62µs max=1.81s    p(90)=1.44s    p(95)=1.62s   
     iterations.....................: 1     0.551421/s
     vus............................: 1     min=1      max=1
     vus_max........................: 1     min=1      max=1
 */