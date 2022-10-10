import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 5,
  duration: "5s",
  thresholds: {
	  "http_req_duration": [{
		  threshold: "p(95)<200"
	  }],
	  "checks": [{
		  threshold: "rate>0.9"
	  }]
  }
};

export default function() {
  let result = http.get(`https://test.k6.io/`);

  check(result, {
    "status is 200": (r) => r.status == 200,
    "Duration < 100ms": (r) => r.timings.duration < 500
  });

  sleep(1);
}

/**
k6 run 04-Thresholds.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 04-Thresholds.js
     output: -

  scenarios: (100.00%) 1 scenario, 5 max VUs, 35s max duration (incl. graceful stop):
           * default: 5 looping VUs for 5s (gracefulStop: 30s)


running (05.4s), 0/5 VUs, 20 complete and 0 interrupted iterations
default ✓ [======================================] 5 VUs  5s

     ✓ status is 200
     ✓ Duration < 100ms

   ✓ checks.........................: 100.00% ✓ 40       ✗ 0  
     data_received..................: 258 kB  48 kB/s
     data_sent......................: 3.7 kB  680 B/s
     http_req_blocked...............: avg=102.53ms min=2µs      med=6µs      max=415.55ms p(90)=410.6ms  p(95)=412.2ms 
     http_req_connecting............: avg=48.45ms  min=0s       med=0s       max=203.08ms p(90)=191.5ms  p(95)=194.23ms
   ✗ http_req_duration..............: avg=216.12ms min=192.54ms med=195.89ms max=387.68ms p(90)=223.48ms p(95)=383.06ms
       { expected_response:true }...: avg=216.12ms min=192.54ms med=195.89ms max=387.68ms p(90)=223.48ms p(95)=383.06ms
     http_req_failed................: 0.00%   ✓ 0        ✗ 20 
     http_req_receiving.............: avg=19.28ms  min=18µs     med=84.5µs   max=191.72ms p(90)=20.49ms  p(95)=189.94ms
     http_req_sending...............: avg=18.2µs   min=7µs      med=18µs     max=35µs     p(90)=26.5µs   p(95)=31.19µs 
     http_req_tls_handshaking.......: avg=52.54ms  min=0s       med=0s       max=215.3ms  p(90)=210.61ms p(95)=211.09ms
     http_req_waiting...............: avg=196.82ms min=192.43ms med=195.35ms max=205.63ms p(90)=204.33ms p(95)=205.62ms
     http_reqs......................: 20      3.715357/s
     iteration_duration.............: avg=1.31s    min=1.19s    med=1.2s     max=1.62s    p(90)=1.6s     p(95)=1.6s    
     iterations.....................: 20      3.715357/s
     vus............................: 5       min=5      max=5
     vus_max........................: 5       min=5      max=5

ERRO[0006] some thresholds have failed 
 */