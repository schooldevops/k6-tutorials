# [K6 Scenario - executor] Per VU iterations

- K6는 다양한 시나리오를 제공하며, 시나리오를 통해서 클라이언트 요청 패턴을 설정할 수 있다. 
- 각 VU는 정확한 수의 반복을 실행해야하는 경우 적합한 실행기이다. 
- '완료된 반복의 총 수 = vus * 반복횟수' 의 식이 성립된다. 

## Options

- 일반적인 구성 옵션 외에 이 실행 프로그램은 다음 옵션도 추가한다. 
- 일반적인 구성옵션: https://k6.io/docs/using-k6/scenarios#common-options

|OPTION|	TYPE|	DESCRIPTION|	DEFAULT|
|---|---|---|---|
|vus|	integer|	동시에 실행될 VU의 수 |	1|
|iterations|	integer|	각 VU에 의해서 수행될 function 반복 수 |	1|
|maxDuration|	string|	강제로 중지되기 전의 최대 시나리오 지속 시간 (gracefulStop제외)|	"10m"|

## 언제 사용할까?

- 동일한 양의 반복을 완료하기 위해 특정 양의 VU가 필요한 경우 이 실행기를 사용하라. 
- 이는 VU간에 분할 하려는 고정 테스트 데이터 세트가 있는 경우에 유용하다. 

## Example

- 이 예제에서 10개의 VU가 최대 30초 동안 총 200번의 반복에 대해 각 20번의 반복을 실행하도록 한다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 20,
      maxDuration: '30s',
    },
  },
};

export default function () {
  http.get('https://test.k6.io/contacts.php');
  // 설명 목적으로만 처리 일시 중지를 삽입하였다. 
  // 각 반복은 ~515ms 이므로 VU 최대 처리량당 ~2 반복/s 가 된다. 
  sleep(0.5);
}

```

- executor: 'per-vu-iterations' 는 예약어이다. 즉 각 vu마다 동일한 반복을 수행하게 된다. 
- vus: 10개의 vuser 가 동작하게 된다. 
- iterations: 각 vu가 수행할 반복 횟수이다. 
- maxDuration: 최대 실행시간
- 즉, 위 테스트는 10 * 20 의 총 반복횟수를 수행하게 된다. 각 vu마다 20번 반복을 수행하며, 30초가 지나면 테스트는 종료된다. 

- export default function() 은 기본 vu로 테스트 수행될 코드이다. 해당 함수에서 get 을 수행하고 0.5초 대기하고 다시 수행된다. 

## 관찰 

- 다음 그래프는 예제의 실행 결과를 보여준다. 
  
![per-vu-iterations](imgs/shared-iterations.webp)

- 테스트 시나리오 입력 및 결과를 기반으로 
  - VU의 수는 10으로 고정되어 있으며 테스트가 시작되기 전에 초기화 된다. 
  - 총 반복은 VU당 20회 반복으로 고정된다. 즉, 200회 반복, 10VU * 각 20회 반복된다. 
  - 기본 functioin의 각 반복은 대략 512ms 또는 ~2/s가 될 것으로 판단된다. 
  - 따라서 최대 처리량(최고 효율)은 ~20/s, 2 iter / s * 10VU로 계산된다. 
  - 그러면 최대 처리량에 도달했지만 유지되지 않는 것을 볼 수 있다. 
  - 반복 배포가 VU 사이에 있기 때문에 빠른 VU가 일찍 완료되고 나머지 테스트 동안 유휴 상태가 되어 효율성이 저하될 수 있다. 
  - 9초의 총 지속 시간은 효율성이 낮기 때문에 공유 반복보다 약간 더 길다. 
  - 전체 테스트 기간은 가장 느린 VU가 20개 요청을 완료하는 데 걸리는 시간만큼 지속된다. 

## WrapUp

- 각 vu마다 동일한 반복 횟수를 수행해야하는 경우 'per-vu-iterations' 를 executor로 지정하면 된다. 
- 테스트를 골고루 수행해야하는 경우에 위와 같은 시나리오가 적합하다. 