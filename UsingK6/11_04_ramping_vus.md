# Ramping Vus

- 가변 수의 VU는 지정된 시간동안 가능한 많은 반복을 실행한다. 
- 이는 초기 vu를 지정하고, 각 스테이지 (rampingUp, load, rampingBackDown 등의 패턴) 에 따라 vus를 증가, 유지, 감소 형태로 테스트를 수행한다. 
- 이 실행기는 전역 스테이지 옵션을 사용한 것과 동일하다. https://k6.io/docs/using-k6/options#stages 참고하기

## Options 

- 일반적인 구성 옵션 외에 이 실행 프로그램은 다음 옵션도 추가한다. 
- 일반적인 구성옵션: https://k6.io/docs/using-k6/scenarios#common-options

|OPTION|	TYPE|	DESCRIPTION|	DEFAULT|
|---|---|---|---|
|stages(required)|	array|	증가 또는 감소할 VU의 대상 수를 지정하는 객체의 배열이다. |	[]|
|startVUs|	integer|	VU의 수로 테스트 시작시에 생성되는 VU 수이다.|	1|
|gracefulRampDown|	string|	램프 다운 중에 중지하기 전에 이미 시작된 반복이 완료될 때까지 걸리는 시간이다. |	"30s"|

## 언제 사용할까?

- 이 실행기는 특정 기간 동안 VU를 증가 또는 감소해야 하는 경우 적합하다. 
- 예를 들어 서버가 기동되고 특정 유저로 웜업을 하고, 사용자가 들어와 부하를 발생시킨 후, 이벤트 등으로 피크 부하를 발생하는 상황등을 테스트하고 싶을때 유용하다. 

## Example

- 이 예제에서는 2단계 테스트를 실행하여 20초 동안 0에서 10VU로 증가시킨 다음 10초 동안 0VU로 감소한다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '0s',
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

- discardResponseBodies: 서버의 응답이 오더라도 컨텐츠 내용을 메모리에 저장하지 않고 버릴지 여부 true인경우 컨텐츠 body는 저장하지 않고 버린다. 
- scenarios: 테스트를 어떠한 주기로 수행될지를 지정
  - contacts: 시나리오 이름을 지정한다. 
  - executor: 시나리오 실행기 중 하나인 ramping-uvs 를 지정했다. 이를 통해서 vus와 시간을 각 단계별로 지정이 가능하다. 
  - startVUs: 시작 vuser를 지정한다. 여기서는 0으로 지정했으므로 처음 테스트가 수행될때 vu가 없이 시작되었다가 스테이지에 따라 부하가 생성된다. 
  - stages: 전역 스테이지와 유사하게 각 테스트 단계를 지정할 수 있다. 보통은 rampingUp, load, rampingBackDown 으로 이동할 수 있다. 
    - duration: 요청시간
    - target: 대상 vus
- GracefulRampDown을 0으로 설정하면 램프 다운 단계에서 일부 반복이 중단될 수 있다. 

## 관찰 

- 다음 그래프는 예제 스크립트 성능을 보여준다. 

![ramping-vus](imgs/ramping-vus.webp)

- 테스트 시나리오 입력 및 결과를 기반으로 
  - 총 30초의 테스트 기간 동안 2개의 단계를 정의했다. 
  - 1단계는 20초 동안 0 ~ 10 목표 VU까지 선형으로 증가 시킨다. 
  - 1단계 이후 끝날때 10개의 VU에서 10초 동안 0의 VU까지 선형적으로 VU를 감소 시킨다. 
  - 기본 function의 각 반복은 대략 512ms 또는 2/s 가 될것으로 예상된다. 
  - VU 수가 변동됨에 따라 반복 속도는 직접적인 상관 관계가 있다. VU를 추가할 때마다 속도가 2iter/s 씩 증가하는 반면 VU를 뺄때마다 2iter/s 씩 감소한다. 
  - 예제 테스트 과정에서 ~300번의 반복을 수행했다. 

## 스테이지 인덱스 가져오기 

- 현재 실행중인 단계 인덱스를 가져오려면 k6-jslib-utils 라이브러리에서 getCurrentStageIndex 도우미 함수를 사용한다. 
- 바로 가기 단계 배열 또는 실행기의 단계 배열에서 위치와 동일한 0부터 시작하는 숫자를 반환한다. 

```js
import { getCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js';

export const options = {
  stages: [
    { target: 10, duration: '30s' },
    { target: 50, duration: '1m' },
    { target: 10, duration: '30s' },
  ],
};

export default function () {
  if (getCurrentStageIndex() === 1) {
    console.log('Running the second stage where the expected target is 50');
  }
}
```

- 이 기능을 사용하면 현재 실행중인 단계를 사용하여 자동적으로 태그를 지정할 수 있다. 
- 자세한 내용은 태그 지정 단계 섹션 확인하기 https://k6.io/docs/using-k6/tags-and-groups/#tagging-stages

## WrapUp

- 지금가지 vu와 실행 시간을 각 단계별로 지정하고 테스트할 수 있는 시나리오를 알아 보았다. 
- ramping-vus 실행기를 이용하여 원하는 스테이지 테스트를 수행할 수 있다. 
- 일반적인 스테이지는 rampingUp, load, rampingBackDown 등의 단계로 테스트를 수행할 수 있다. 