import http from 'k6/http';
import { sleep } from 'k6';

export default function() {
  let result = http.get(`https://test-api.k6.io/`);
  sleep(1)
}

/**
k6 run 01-helloworld.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 01-helloworld.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 1 iterations for each of 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m02.5s), 0/1 VUs, 1 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m02.5s/10m0s  1/1 iters, 1 per VU

     data_received..................: 21 kB 8.5 kB/s
     data_sent......................: 446 B 178 B/s
     http_req_blocked...............: avg=1.28s    min=1.28s    med=1.28s    max=1.28s    p(90)=1.28s    p(95)=1.28s   
     http_req_connecting............: avg=205.2ms  min=205.2ms  med=205.2ms  max=205.2ms  p(90)=205.2ms  p(95)=205.2ms 
     http_req_duration..............: avg=218.81ms min=218.81ms med=218.81ms max=218.81ms p(90)=218.81ms p(95)=218.81ms
       { expected_response:true }...: avg=218.81ms min=218.81ms med=218.81ms max=218.81ms p(90)=218.81ms p(95)=218.81ms
     http_req_failed................: 0.00% ✓ 0        ✗ 1  
     http_req_receiving.............: avg=159µs    min=159µs    med=159µs    max=159µs    p(90)=159µs    p(95)=159µs   
     http_req_sending...............: avg=335µs    min=335µs    med=335µs    max=335µs    p(90)=335µs    p(95)=335µs   
     http_req_tls_handshaking.......: avg=230.8ms  min=230.8ms  med=230.8ms  max=230.8ms  p(90)=230.8ms  p(95)=230.8ms 
     http_req_waiting...............: avg=218.31ms min=218.31ms med=218.31ms max=218.31ms p(90)=218.31ms p(95)=218.31ms
     http_reqs......................: 1     0.398081/s
     iteration_duration.............: avg=2.51s    min=2.51s    med=2.51s    max=2.51s    p(90)=2.51s    p(95)=2.51s   
     iterations.....................: 1     0.398081/s
     vus............................: 1     min=1      max=1
     vus_max........................: 1     min=1      max=1
 */