# Module

- 테스트 스크립트를 작성할때 서로다른 모듈을 임포트 하거나, 모듈의 부분을 로드하여 사용한다. 
- 다음 3가지 모듈이 있다. 
  - 내장 모듈
  - 로컬 파일 시스템 모듈
  - 원격 HTTP(s) 모듈

## 내장 모듈

- 이 모듈은 k6코어에서 제공하는 모듈이다. 
- 예를 들어 http 모듈은 테스트상에서 서버로 요청을 보내는 모듈이다. 
- 모듈 전체 내용은 https://k6.io/docs/javascript-api 를 참조하자. 

```js
import http from 'k6/http';
```

## 로컬 파일 시스템 모듈

- 이 모듈은 로컬 파일 시스템에 저장된 모듈이다. 
- 상태 혹은 절대 경로로 접근이 가능하다. 

```js
//helpers.js
export function someHelper() {
  // ...
}
```

- 사용은 다음과 같이 한다. 

```js
//my-test.js
import { someHelper } from './helpers.js';

export default function () {
  someHelper();
}
```

## 원격 HTTP(S) 모듈

- 이 모듈은 HTTP(S)를 통해서 접근 가능한 모듈이다. 
- 웹 서버에 퍼블릭 엑세스로 해당 소스를 획득한다. 
- 모듈을 로드하면 다운로드 하게 되고, 실행 시간에 수행하게 된다. 

```js
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export default function () {
  randomItem();
}
```

## JSLib 리포지토리 

- JSLib는 라이브러리 셋으로, k6와 유연하게 적용이 가능하다. 
- https://jslib.k6.io/ 에서 참조 가능하다. 
- 이 라이브러리들은 다운로드하고, 테스트 프로젝트 혹은 HTTP 임포트를 통해서 사용이 가능하다. 

- 이후 번들링 참조 
  
from: https://k6.io/docs/using-k6/modules/
