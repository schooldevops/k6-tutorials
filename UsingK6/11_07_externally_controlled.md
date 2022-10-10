# Externally controlled

- k6의 REST API 또는 CLI 를 통해 런타임 시 실행을 제어하고 확장한다. 
- 이전에는 pause, resume 및 scale CLI 명령이 k6 실행을 전역적으로 제어하는 데 사용되었다. 
- 이 실행기는 런타임에 k6 실행을 제어하는 데 사용할 수 있는 더나은 API를 제공하여 동일한 작업을 수행한다. 

- 활성 또는 최대 VU 양을 변경하기 위해 scale CLI 명령에 인수를 전달하면 외부에서 제어되는 실행자에만 영향을 미친다. 

## Options

- 일반적인 구성 옵션 외에 이 실행 프로그램은 다음 옵션도 추가한다. 
- 일반적인 구성옵션: https://k6.io/docs/using-k6/scenarios#common-options

|OPTION|	TYPE|	DESCRIPTION|	DEFAULT|
|---|---|---|---|
|duration(required)|	string|	총 테스트 기간 |	-|
|vus|	integer|	동시에 수행할 VU수|	-|
|maxVUs|	integer|	테스트 실행 중에 허용할 최대 VU수|	-|

## When to use

- 테스트가 실행되는 동안 VU수를 제어하려는 경우 
- 중요: 이것은 k6 클라우드에서 지원되지 않는 유일한 실행기이며 k6 실행과 함께 로컬에서만 사용할 수 있다. 

## Example

- 이 예제는 10개의 VU에서 시작하여 최대 50개의 VU와 총 10분 동안 런타임에 제어 가능한 테스트를 실행한다. 

```js
import http from 'k6/http';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'externally-controlled',
      vus: 10,
      maxVUs: 50,
      duration: '10m',
    },
  },
};

export default function () {
  http.get('https://test.k6.io/contacts.php');
}

```

