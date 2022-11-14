# [K6 Scenario - executor] Shared iterations

- K6는 다양한 시나리오를 제공하며, 시나리오를 통해서 클라이언트 요청 패턴을 설정할 수 있다. 
- 고정된 수의 반복이 여러 VU들 사이에 "공유" 되며 모든 반복이 실행되면 테스트가 종료된다. 

- 꼭 기억해야할 사항은 공유 라는 의미는 요청이 공정하게 분산되지 않으며 더 빨리 실행되면 더 많은 반복을 수행한다.
- 공유된 반복이 완료되면, 테스트는 종료된다. 

## Options

- 일반적인 구성 옵션 외에 이 실행 프로그램은 다음 옵션도 추가한다. 
- 일반적인 구성옵션: https://k6.io/docs/using-k6/scenarios#common-options

|OPTION|	TYPE|	DESCRIPTION|	DEFAULT|
|---|---|---|---|
|vus|	integer|	동시에 실행할 VU수|	1|
|iterations|	integer|	모든 VU 들이 수행할 스크립트 반복의 총 횟수 |	1|
|maxDuration|	string|	강제로 중지되기 전에 최대 시나리오 지속시간 (gracefulStop 제외)|	"10m"|

## 언제 사용할까?

- 이 실행기는 특정 양의 VU로 고정된 총 반복 횟수를 완료하고 VU당 반복 횟수가 중요하지 않을 때 적합하다. (모든 vu가 공정하게 반복을 수행하지 않는다는 의미)
- 이것은 VU의 가장 효율적인 사용이 될 것이므로 여러 테스트 반복을 완료하는 데 걸리는 시간이 염려되는 경우 이 실행기가 좋은 성능을 발휘할 것이다.
- 개발 초기에 빠르게 테스트를 수행하고자 할때 이 실행기(executor)를 사용한다. 

## 예제

- 이 예제에서는 최대 30초 동안 10개의 VU가 공유하는 총 200개의 반복을 실행한다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 200,
      maxDuration: '30s',
    },
  },
};

export default function () {
  http.get('https://test.k6.io/contacts.php');
  // 설명을 위한 목적으로만 처리 일시 중지를 삽입하고 있다. 
  // 각 반복은 ~512ms 가 될 것이다. 그러므로 각 VU 최대 처리량은 ~2 반복/초 이다.
  sleep(0.5);
}

```

- executor: 'shared-iterations' 실행기를 사용한다는 의미이다. 이는 예약어이므로 정확한 단어인지 확인하자. 
- vus: 10 가상유저를 수행한다. 즉 10개의 vu가 수행이 된다는 의미이다. 
- iterations: 200 공유된 반복 횟수로 10개 vu가 모두 합쳐 200번 수행되었다면 테스트가 종료된다. 
- maxDurations: 최대 실행 시간으로 30초로 지정하고 있다. 
- 즉, 위 코드는 모두 합쳐 vu가 200번 수행되거나, 최대 30초가 지나면 테스트가 종료된다는 의미이다. 

- export default function() 은 기본 vu로 테스트 수행될 코드이다. 해당 함수에서 get 을 수행하고 0.5초 대기하고 다시 수행된다. 

## 관찰

- 다음 그래프는 예제 스크립트의 성능을 보여준다. 

![shared-iterations](imgs/shared-iterations.webp)

- 테스트 시나리오 입력 및 결과를 기반으로
  - 테스트는 기본 function에 대해 고정된 200회 반복으로 제한된다. 
  - VU의 수는 10으로 고정되며 테스트가 시작되기 전에 초기화 된다. 
  - 기본 function의 각 반복은 대략 515ms 또는 ~2/s 가 될 것으로 예상된다. 
  - 최대 처리량(최고 효율)은 그러므로 ~20/s 이며 2 iter/s * 10 Vus의 결과이다. 
  - 테스트의 더 많은 부분에 대해 최대 처리량이 유지된다는 것을 알 수 있다. 
  - 8초 테스트 기간은 모든 executor 방법중 가장 짧다. 
  - 반복 분포가 왜곡될 수 있음을 알고 있다. 한 VU는 50회 반복을 수행한 반면 다른 VU는 10회만 수행했을 수 있다. 

## WrapUp

- 공유된 반복수 혹은 최대 테스트 시간동안 요청을 호출해야하는 경우 shared-iterations 실행기를 사용한다는 것을 살펴 보았다. 
- 모든 vu는 best-effort 로 수행되므로, 즉 테스트 수행 결과가 빠른 vuser는 더 많은 반복을 수행하게 된다. 
- 이 테스트는 테스트 기간동안 짧게 시나리오를 돌려보고자 하는 경우 유용하다. 