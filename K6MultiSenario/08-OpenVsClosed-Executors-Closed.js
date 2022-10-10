import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 1,
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
k6 run 08-OpenVsClosed-Executors-Closed.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 08-OpenVsClosed-Executors-Closed.js
     output: -

  scenarios: (100.00%) 1 scenario, 10 max VUs, 50s max duration (incl. graceful stop):
           * contacts: Up to 10 looping VUs for 20s over 2 stages (gracefulRampDown: 30s, gracefulStop: 30s)


running (24.8s), 00/10 VUs, 22 complete and 0 interrupted iterations
contacts ✓ [======================================] 00/10 VUs  20s

     data_received..................: 65 kB  2.6 kB/s
     data_sent......................: 5.5 kB 221 B/s
     http_req_blocked...............: avg=167.35ms min=2µs      med=6µs      max=453.62ms p(90)=409.48ms p(95)=422.26ms
     http_req_connecting............: avg=81.57ms  min=0s       med=0s       max=213.88ms p(90)=202.62ms p(95)=203.81ms
     http_req_duration..............: avg=200.95ms min=192.22ms med=200.85ms max=214.64ms p(90)=208.1ms  p(95)=208.74ms
       { expected_response:true }...: avg=200.95ms min=192.22ms med=200.85ms max=214.64ms p(90)=208.1ms  p(95)=208.74ms
     http_req_failed................: 0.00%  ✓ 0        ✗ 22  
     http_req_receiving.............: avg=78.13µs  min=27µs     med=74.5µs   max=159µs    p(90)=125.6µs  p(95)=130.75µs
     http_req_sending...............: avg=41.22µs  min=10µs     med=27µs     max=314µs    p(90)=40.8µs   p(95)=68.54µs 
     http_req_tls_handshaking.......: avg=83.77ms  min=0s       med=0s       max=213.18ms p(90)=208.74ms p(95)=209.08ms
     http_req_waiting...............: avg=200.83ms min=192.09ms med=200.79ms max=214.45ms p(90)=208.05ms p(95)=208.63ms
     http_reqs......................: 22     0.886689/s
     iteration_duration.............: avg=5.36s    min=5.19s    med=5.2s     max=5.65s    p(90)=5.62s    p(95)=5.63s   
     iterations.....................: 22     0.886689/s
     vus............................: 1      min=1      max=9 
     vus_max........................: 10     min=10     max=10

 */