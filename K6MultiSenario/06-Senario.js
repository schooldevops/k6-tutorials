import http from 'k6/http';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    Scenario_GetCrocodiles: {
      exec: 'FunctionForThisScenario',
      executor: 'ramping-vus',
      startTime: '0s',
      startVUs: 1,
      stages: [
        { duration: '5s', target: 5 },
      ],
    },
    Scenario_GetContacts: {
      exec: 'FunctionGetContacts',
      executor: 'ramping-vus',
      startTime: '3s',
      startVUs: 5,
      stages: [
        { duration: '2s', target: 5 },
      ],
    },    
  },
};

export default function () {
  // http.get('https://test.k6.io/contacts.php');
}

export function FunctionForThisScenario() {
  http.get('https://test-api.k6.io/public/crocodiles/');
}

export function FunctionGetContacts() {
  http.get('https://test.k6.io/contacts.php');
}

/**
k6 run 06-Senario.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 06-Senario.js
     output: -

  scenarios: (100.00%) 2 scenarios, 10 max VUs, 35s max duration (incl. graceful stop):
           * Scenario_GetCrocodiles: Up to 5 looping VUs for 5s over 1 stages (gracefulRampDown: 30s, exec: FunctionForThisScenario, gracefulStop: 30s)
           * Scenario_GetContacts: Up to 5 looping VUs for 2s over 1 stages (gracefulRampDown: 30s, exec: FunctionGetContacts, startTime: 3s, gracefulStop: 30s)


running (05.2s), 00/10 VUs, 92 complete and 0 interrupted iterations
Scenario_GetCrocodiles ✓ [======================================] 0/5 VUs  5s
Scenario_GetContacts   ✓ [======================================] 0/5 VUs  2s

     data_received..................: 121 kB 23 kB/s
     data_sent......................: 14 kB  2.6 kB/s
     http_req_blocked...............: avg=48.52ms  min=1µs      med=3.5µs    max=572.79ms p(90)=71.4µs   p(95)=498.57ms
     http_req_connecting............: avg=19.31ms  min=0s       med=0s       max=207.44ms p(90)=0s       p(95)=195.37ms
     http_req_duration..............: avg=207.04ms min=189.55ms med=208.67ms max=224.49ms p(90)=219.67ms p(95)=221.08ms
       { expected_response:true }...: avg=207.04ms min=189.55ms med=208.67ms max=224.49ms p(90)=219.67ms p(95)=221.08ms
     http_req_failed................: 0.00%  ✓ 0         ✗ 92  
     http_req_receiving.............: avg=64.96µs  min=23µs     med=51µs     max=335µs    p(90)=93.7µs   p(95)=133.69µs
     http_req_sending...............: avg=20.49µs  min=6µs      med=16µs     max=293µs    p(90)=23.9µs   p(95)=31.89µs 
     http_req_tls_handshaking.......: avg=20.03ms  min=0s       med=0s       max=214.37ms p(90)=0s       p(95)=200.79ms
     http_req_waiting...............: avg=206.95ms min=189.25ms med=208.62ms max=224.43ms p(90)=219.62ms p(95)=221.02ms
     http_reqs......................: 92     17.759997/s
     iteration_duration.............: avg=255.7ms  min=189.63ms med=210.15ms max=776.34ms p(90)=224.35ms p(95)=705.77ms
     iterations.....................: 92     17.759997/s
     vus............................: 9      min=1       max=9 
     vus_max........................: 10     min=10      max=10

 */