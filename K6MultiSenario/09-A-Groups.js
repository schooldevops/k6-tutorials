import http from 'k6/http';
import {group, sleep} from 'k6';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    Scenario_GetCrocodiles: {
      exec: 'FunctionForThisScenario',
      executor: 'ramping-vus',
      startTime: '0s',
      startVUs: 5,
      stages: [
        { duration: '10s', target: 5 },
      ],
    },
    Scenario_GetContacts: {
      exec: 'FunctionGetContacts',
      executor: 'ramping-vus',
      startTime: '0s',
      startVUs: 5,
      stages: [
        { duration: '10s', target: 5 },
      ],
    },
  },
};

/* export default function () {
  http.get('https://test.k6.io/contacts.php');
} */

export function FunctionForThisScenario() {
  http.get('https://test-api.k6.io/public/crocodiles/');

 group('Do something and wait', function () {
    // ...
    DoSomethingAndWait();
  }); 

}

export function FunctionGetContacts() {
  

  group('Internal Group, lambda-like', ()=>{
    // do something

    group('Sleeping group, also nested...', ()=> {
      http.get('https://test.k6.io/contacts.php');

      sleep(3);
    });

    // do something more

  });
}

function DoSomethingAndWait() {
  // ...
  sleep(5);
}

/**
k6 run 09-A-Groups.js 

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 09-A-Groups.js
     output: -

  scenarios: (100.00%) 2 scenarios, 10 max VUs, 40s max duration (incl. graceful stop):
           * Scenario_GetContacts: Up to 5 looping VUs for 10s over 1 stages (gracefulRampDown: 30s, exec: FunctionGetContacts, gracefulStop: 30s)
           * Scenario_GetCrocodiles: Up to 5 looping VUs for 10s over 1 stages (gracefulRampDown: 30s, exec: FunctionForThisScenario, gracefulStop: 30s)


running (11.1s), 00/10 VUs, 25 complete and 0 interrupted iterations
Scenario_GetContacts   ✓ [======================================] 0/5 VUs  10s
Scenario_GetCrocodiles ✓ [======================================] 0/5 VUs  10s

     █ Internal Group, lambda-like

       █ Sleeping group, also nested...

     █ Do something and wait

     data_received..................: 74 kB  6.6 kB/s
     data_sent......................: 6.3 kB 565 B/s
     group_duration.................: avg=3.79s    min=3.19s    med=3.48s    max=5s       p(90)=5s       p(95)=5s      
     http_req_blocked...............: avg=207.06ms min=3µs      med=9µs      max=580.74ms p(90)=567.05ms p(95)=576.71ms
     http_req_connecting............: avg=79.56ms  min=0s       med=0s       max=206.87ms p(90)=202.99ms p(95)=205.9ms 
     http_req_duration..............: avg=242.77ms min=190.19ms med=208ms    max=389.85ms p(90)=385.96ms p(95)=386.89ms
       { expected_response:true }...: avg=242.77ms min=190.19ms med=208ms    max=389.85ms p(90)=385.96ms p(95)=386.89ms
     http_req_failed................: 0.00%  ✓ 0       ✗ 25  
     http_req_receiving.............: avg=52.12µs  min=8µs      med=45µs     max=201µs    p(90)=94.2µs   p(95)=109.79µs
     http_req_sending...............: avg=18.48µs  min=8µs      med=16µs     max=43µs     p(90)=37.4µs   p(95)=41.4µs  
     http_req_tls_handshaking.......: avg=84.46ms  min=0s       med=0s       max=219.11ms p(90)=218.02ms p(95)=218.44ms
     http_req_waiting...............: avg=242.7ms  min=190.06ms med=207.92ms max=389.81ms p(90)=385.88ms p(95)=386.81ms
     http_reqs......................: 25     2.25257/s
     iteration_duration.............: avg=4.25s    min=3.19s    med=3.76s    max=5.7s     p(90)=5.68s    p(95)=5.7s    
     iterations.....................: 25     2.25257/s
     vus............................: 5      min=5     max=10
     vus_max........................: 10     min=10    max=10
 */