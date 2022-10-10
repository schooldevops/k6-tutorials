import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  thresholds: {
	  "http_req_duration": [{
		  threshold: "p(95)<200"
	  }],
	  "checks": [{
		  threshold: "rate>0.9"
	  }],
	  // "errors": ["rate<0.1"]
  },
  stages: [
    { duration: '2s', target: 5 },
	{ duration: '3s', target: 10 },
	{ duration: '3s', target: 5 },
	{ duration: '2s', target: 1 }
  ]
};

export default function() {
	let result = http.get('https://test-api.k6.io/public/crocodiles/');
	
	check(result, {
		"Status is 200": (r) => r.status == 200,
		"Duration < 600ms": (r) => r.timings.duration < 600
	});
	
	sleep(1);
}

/**
k6 run 05-Stages.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 05-Stages.js
     output: -

  scenarios: (100.00%) 1 scenario, 10 max VUs, 40s max duration (incl. graceful stop):
           * default: Up to 10 looping VUs for 10s over 4 stages (gracefulRampDown: 30s, gracefulStop: 30s)


running (10.7s), 00/10 VUs, 50 complete and 0 interrupted iterations
default ✓ [======================================] 00/10 VUs  10s

     ✓ Status is 200
     ✓ Duration < 600ms

   ✓ checks.........................: 100.00% ✓ 100      ✗ 0   
     data_received..................: 96 kB   9.0 kB/s
     data_sent......................: 9.4 kB  878 B/s
     http_req_blocked...............: avg=81.43ms  min=3µs      med=6µs      max=434.71ms p(90)=406ms    p(95)=416.32ms
     http_req_connecting............: avg=39.4ms   min=0s       med=0s       max=209.47ms p(90)=196.24ms p(95)=201.89ms
   ✗ http_req_duration..............: avg=212.36ms min=197.8ms  med=209.53ms max=365.4ms  p(90)=223.11ms p(95)=223.3ms 
       { expected_response:true }...: avg=212.36ms min=197.8ms  med=209.53ms max=365.4ms  p(90)=223.11ms p(95)=223.3ms 
     http_req_failed................: 0.00%   ✓ 0        ✗ 50  
     http_req_receiving.............: avg=88.06µs  min=30µs     med=79µs     max=453µs    p(90)=109.6µs  p(95)=160.1µs 
     http_req_sending...............: avg=32.61µs  min=5µs      med=24µs     max=359µs    p(90)=47.1µs   p(95)=50.55µs 
     http_req_tls_handshaking.......: avg=41.02ms  min=0s       med=0s       max=216.73ms p(90)=202.64ms p(95)=211.09ms
     http_req_waiting...............: avg=212.24ms min=197.67ms med=209.33ms max=365.28ms p(90)=223.02ms p(95)=223.19ms
     http_reqs......................: 50      4.651975/s
     iteration_duration.............: avg=1.29s    min=1.19s    med=1.21s    max=1.64s    p(90)=1.61s    p(95)=1.63s   
     iterations.....................: 50      4.651975/s
     vus............................: 2       min=2      max=10
     vus_max........................: 10      min=10     max=10

ERRO[0011] some thresholds have failed 
 */