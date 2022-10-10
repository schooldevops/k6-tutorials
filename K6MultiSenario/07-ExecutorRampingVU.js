import http from 'k6/http';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 25 },
        { duration: '5s', target: 0 },
      ],
    },
  },
};

export default function () {
  http.get('https://test.k6.io/contacts.php');
}

/**
k6 run 07-ExecutorRampingVU.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 07-ExecutorRampingVU.js
     output: -

  scenarios: (100.00%) 1 scenario, 25 max VUs, 40s max duration (incl. graceful stop):
           * contacts: Up to 25 looping VUs for 10s over 2 stages (gracefulRampDown: 30s, gracefulStop: 30s)


running (10.1s), 00/25 VUs, 576 complete and 0 interrupted iterations
contacts ✓ [======================================] 00/25 VUs  10s

     data_received..................: 546 kB 54 kB/s
     data_sent......................: 72 kB  7.1 kB/s
     http_req_blocked...............: avg=21.3ms   min=0s       med=3µs      max=1.25s    p(90)=5µs      p(95)=8µs     
     http_req_connecting............: avg=8.55ms   min=0s       med=0s       max=218.61ms p(90)=0s       p(95)=0s      
     http_req_duration..............: avg=200.09ms min=188.15ms med=199.64ms max=230.56ms p(90)=209.23ms p(95)=218.74ms
       { expected_response:true }...: avg=200.09ms min=188.15ms med=199.64ms max=230.56ms p(90)=209.23ms p(95)=218.74ms
     http_req_failed................: 0.00%  ✓ 0         ✗ 576 
     http_req_receiving.............: avg=59.56µs  min=7µs      med=52µs     max=1.26ms   p(90)=82µs     p(95)=113.49µs
     http_req_sending...............: avg=18.48µs  min=2µs      med=16µs     max=1.27ms   p(90)=25µs     p(95)=28µs    
     http_req_tls_handshaking.......: avg=8.83ms   min=0s       med=0s       max=220.99ms p(90)=0s       p(95)=0s      
     http_req_waiting...............: avg=200.01ms min=188.09ms med=199.58ms max=230.48ms p(90)=209.19ms p(95)=218.67ms
     http_reqs......................: 576    57.086507/s
     iteration_duration.............: avg=221.5ms  min=188.23ms med=199.88ms max=1.45s    p(90)=218.47ms p(95)=221.36ms
     iterations.....................: 576    57.086507/s
     vus............................: 1      min=1       max=24
     vus_max........................: 25     min=25      max=25
 */