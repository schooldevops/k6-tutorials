import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// http 요청에 대한 단순 카운터 커스텀 메트릭 생성 
export const requests = new Counter('http_reqs');

// 테스트의 스테이지를 지정할 수 있다. (ramp up/down patterns) 형태이며 options 객체에 VU의 수를 각각 지정이 가능하다. 
export const options = {
  stages: [
    { target: 20, duration: '1m' }, // ramp up 을 1분동안 20 vuser를 생성한다. 
    { target: 15, duration: '1m' }, // 이후 1분동안 15명의 vuser로 요청을 보낸다. 
    { target: 0, duration: '1m' },  // ramp down 을 1분동안 0 vuser로 다운시킨다.
  ],
  thresholds: {
    http_reqs: ['count < 100'], // 테스트 종료 조건, count 값이 100 이하인경우 정상, 아닌경우 비정상이다. 
  },
};

export default function () {
  // 우리의 HTTP 요청, 중요 우리는 응답 정보를 res에 저장한다. 이는 나중에 접근할 수 있다. 
  const res = http.get('http://test.k6.io');

  // 1초 대기
  sleep(1);

  // check 수행 
  // r.status 가 200인지 확인하고, Feel free to browse 값이 포함된경우 라면 true, 아니면 false
  const checkRes = check(res, {
    'status is 200': (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Feel free to browse') !== -1,
  });
}

/**
 * $ k6 run 01_single_request.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: 01_single_request.js
     output: -

  scenarios: (100.00%) 1 scenario, 20 max VUs, 3m30s max duration (incl. graceful stop):
           * default: Up to 20 looping VUs for 3m0s over 3 stages (gracefulRampDown: 30s, gracefulStop: 30s)


running (3m00.1s), 00/20 VUs, 1475 complete and 0 interrupted iterations
default ✓ [======================================] 00/20 VUs  3m0s

     ✓ status is 200
     ✗ response body
      ↳  0% — ✓ 0 / ✗ 1475

     checks.........................: 50.00% ✓ 1475     ✗ 1475
     data_received..................: 18 MB  98 kB/s
     data_sent......................: 307 kB 1.7 kB/s
     http_req_blocked...............: avg=4.94ms   min=0s       med=5µs      max=710.68ms p(90)=12µs     p(95)=14µs    
     http_req_connecting............: avg=3.03ms   min=0s       med=0s       max=211.92ms p(90)=0s       p(95)=0s      
     http_req_duration..............: avg=232.7ms  min=186.8ms  med=203.54ms max=1.67s    p(90)=249.92ms p(95)=388.94ms
       { expected_response:true }...: avg=232.7ms  min=186.8ms  med=203.54ms max=1.67s    p(90)=249.92ms p(95)=388.94ms
     http_req_failed................: 0.00%  ✓ 0        ✗ 2950
     http_req_receiving.............: avg=4.11ms   min=9µs      med=84µs     max=223.58ms p(90)=202µs    p(95)=294.84µs
     http_req_sending...............: avg=27.85µs  min=3µs      med=21µs     max=1.93ms   p(90)=47.1µs   p(95)=55µs    
     http_req_tls_handshaking.......: avg=1.88ms   min=0s       med=0s       max=521.08ms p(90)=0s       p(95)=0s      
     http_req_waiting...............: avg=228.56ms min=186.77ms med=203.08ms max=1.67s    p(90)=237.73ms p(95)=272.76ms
   ✗ http_reqs......................: 2950   16.37573/s
     iteration_duration.............: avg=1.47s    min=1.38s    med=1.4s     max=2.97s    p(90)=1.58s    p(95)=1.94s   
     iterations.....................: 1475   8.187865/s
     vus............................: 1      min=1      max=20
     vus_max........................: 20     min=20     max=20

ERRO[0181] some thresholds have failed   
 */