# Graceful Stop

- v0.27.0 이전에는 테스트 기간에 도달하거나 stage 옵션으로 VU를 축소할 때 k6이 진행 중인 모든 반복을 중단했다. 
- 어떤 경우에는 이것이 왜곡된 메트릭과 예기치 않은 테스트 결과로 이어질 수 있다. 
- v0.27.0 부터 이 동작은 gracefulStop 및 gracefulRampDown 옵션을 통해 제어할 수 있다. 

- 이 옵션은 외부 제어를 제외한 모든 실행기에 사용할 수 있으며 사용자가 강제로 중단하기 전에 대기 시간을 지정할 수 있다. 
- 이 속성의 기본값은 30초이다. 

## 예제

```js
import http from 'k6/http';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-vus',
      vus: 100,
      duration: '10s',
      gracefulStop: '3s',
    },
  },
};

export default function () {
  const delay = Math.floor(Math.random() * 5) + 1;
  http.get(`https://httpbin.test.k6.io/delay/${delay}`);
}

```

- 이 스크립트를 실행하면 다음과 같은 결과를 나타난다. 

```js
running (13.0s), 000/100 VUs, 349 complete and 23 interrupted iterations
contacts ✓ [======================================] 100 VUs  10s
```

- 총 테스트 기간이 10초더라도 GracefulStop 으로 인해 실제 실행 시간은 13초로 VU가 진행 중인 반복을 완료하는데 3초의 추가 시간을 제공한다. 
- 현재 진행중인 반복 중 23개가 이 창에서 완료되지 않아 중단되었다. 

## Additional Information

- ramping-vus 실행기인 gracefulRampingDown 에도 유사한 옵션이 있다. 
- 이는 단계에서 정의된 램프 다운 기간 동안 VU가 전역 풀로 반환되기 전에 진행 중인 모든 반복이 완료될 때 까지 k6가 기다려야 하는 시간을 지정한다. 

![arrival-rate-open-closed-model](imgs/arrival-rate-open-closed-model.webp)

- k6에서 우리는 두 개의 "도착속도" 실행기를 사용하여 이 개방형 모델을 구현했다.
- 일정 도착 속도 및 램프 도착 속도 

```js
import http from 'k6/http';

export const options = {
  scenarios: {
    open_model: {
      executor: 'constant-arrival-rate',
      rate: 1,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
    },
  },
};

export default function () {
  //  위의 개병형 모델 도달률 실행기 구성으로, 새로운 VU 반복은 매초 1의 비율로 시작된다. 
  //  따라서 60번의 반복이 완료될 것으로 예상할 수 있다. 
  //  전체 1m 테스트 기간동안 
  http.get('http://httpbin.test.k6.io/delay/6');
}

```

- 이 스크립트를 실행하면 다음과 같은 결과가 나타난다. 

```js
running (1m09.3s), 000/011 VUs, 60 complete and 0 interrupted iterations
open_model ✓ [======================================] 011/011 VUs  1m0s  1 iters/s
```