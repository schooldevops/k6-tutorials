import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check } from 'k6';

let myTrend = new Trend('my_trend');

export default function () {
  // Add tag to request metric data
  let res = http.get('http://httpbin.org/', {
    tags: {
      my_tag: "I'm a tag",
    },
  });

  // Add tag to check
  check(
    res,
    { 'status is 200': (r) => r.status === 200 },
    { my_tag: "I'm a tag" },
  );

  // Add tag to custom metric
  myTrend.add(res.timings.connecting, { my_tag: "I'm a tag" });
}

/**
k6 run 09-B-Tags.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 09-B-Tags.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 1 iterations for each of 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m00.9s), 0/1 VUs, 1 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m00.9s/10m0s  1/1 iters, 1 per VU

     ✓ status is 200

     checks.........................: 100.00% ✓ 1        ✗ 0
     data_received..................: 9.8 kB  11 kB/s
     data_sent......................: 77 B    88 B/s
     http_req_blocked...............: avg=215.11ms min=215.11ms med=215.11ms max=215.11ms p(90)=215.11ms p(95)=215.11ms
     http_req_connecting............: avg=205.1ms  min=205.1ms  med=205.1ms  max=205.1ms  p(90)=205.1ms  p(95)=205.1ms 
     http_req_duration..............: avg=654.96ms min=654.96ms med=654.96ms max=654.96ms p(90)=654.96ms p(95)=654.96ms
       { expected_response:true }...: avg=654.96ms min=654.96ms med=654.96ms max=654.96ms p(90)=654.96ms p(95)=654.96ms
     http_req_failed................: 0.00%   ✓ 0        ✗ 1
     http_req_receiving.............: avg=261µs    min=261µs    med=261µs    max=261µs    p(90)=261µs    p(95)=261µs   
     http_req_sending...............: avg=1ms      min=1ms      med=1ms      max=1ms      p(90)=1ms      p(95)=1ms     
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s      
     http_req_waiting...............: avg=653.69ms min=653.69ms med=653.69ms max=653.69ms p(90)=653.69ms p(95)=653.69ms
     http_reqs......................: 1       1.145171/s
     iteration_duration.............: avg=871.99ms min=871.99ms med=871.99ms max=871.99ms p(90)=871.99ms p(95)=871.99ms
     iterations.....................: 1       1.145171/s
     my_trend.......................: avg=205.103  min=205.103  med=205.103  max=205.103  p(90)=205.103  p(95)=205.103 
 */