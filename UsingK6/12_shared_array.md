# SharedArray

- SharedArray는 VU간에 기본 메모리를 공유하는 배열과 유사한 객체이다. 
- 함수는 한 번만 실행되고 그 결과는 메모리에 한 번 저장된다. 
- 스크립트가 요소를 요청하면 k6는 해당 요소의 복사본을 제공한다. 

- 초기화 컨텍스트에서 SharedArray 를 생성해야한다. 
- 생성자는 SharedArray의 이름과 배열 객체 자체를 반환해야 하는 함수를 사용한다. 

```js
import { SharedArray } from 'k6/data';

const data = new SharedArray('some name', function () {
  const dataArray = [];
  // more operations
  return dataArray; // must be an array
});

```

- name 아규먼트는 필수이다. 
- VU는 JS VM을 완젼히 분리한다. 그리고 k6는 이 값을 반환해야하며 SharedArray를 식별할 필요가 있다. 
- 여러 개의 SharedArray를 가질 수 있고 주어진 VU에 대해 그 중 일부만 로드할 수도 있지만 성능상의 이점은 거의 없다. 

- SharedArray는 다음을 포함한다. 
  - length 로 엘리먼트의 수를 획득할 수 있다. 
  - array[index] 를 통해서 인덱스의 값을 획득할 수 있다. 
  - for-of 루프를 이용할 수 있다. 

- 대부분 케이스에서 SharedArray에 래핑하여 배열 데이터 구조의 메모리 사용량을 줄일 수 있어야한다. 
- 일단 생성되면 SharedArray는 읽기 전용이므로 SharedArray를 사용하여 VU간에 데이터 통신을 할 수 없다. 

- 초기화 코드에서만 SharedArray를 생성해야한다.

## Example

```js
import { SharedArray } from 'k6/data';

const data = new SharedArray('some name', function () {
  // All heavy work (opening and processing big files for example) should be done inside here.
  // This way it will happen only once and the result will be shared between all VUs, saving time and memory.
  const f = JSON.parse(open('./somefile.json'));
  return f; // f must be an array
});

export default function () {
  const element = data[Math.floor(Math.random() * data.length)];
  // do something with element
}

```

## 성능 특성

- 내부적으로 SharedArray의 현재 구현은 JSON으로 마샬된 값을 유지한다. 이들이 요청되는 경우에서만 언마샬이 수행된다. 
- 일반적으로 오퍼레이션은 눈에 띄지 않아야한다. (데이터로 수행하는 다른 작업에 비해), 그러나 작은 데이터 세트의 경우 SharedArray의 성능이 더 나쁠수 있다. 
- 그러나 이것은 사용 사례에 따라 다르다. 

- 테스트를 위해 v0.31.0 버젼에서 100개의 VU가 있는 다음 스크립트를 실행했다.

```js
import { check } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';

const n = parseInt(__ENV.N);
function generateArray() {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = { something: 'something else' + i, password: '12314561' };
  }
  return arr;
}

let data;
if (__ENV.SHARED === 'true') {
  data = new SharedArray('my data', generateArray);
} else {
  data = generateArray();
}

export default function () {
  const iterationData = data[Math.floor(Math.random() * data.length)];
  const res = http.post('https://httpbin.test.k6.io/anything', JSON.stringify(iterationData), {
    headers: { 'Content-type': 'application/json' },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
}

```

- 표에서 알 수 있듯이 성능은 더 적은 수의 데이터 라인에서도 크게 다르지 않다. 
- 약 1000개의 데이터 라인까지 SharedArray는 메모리 사용량에 거의 이점이 없고, CPU 사용량의 상한선이 더 높다. (실제는 더 높지는 않음)

- 10k 라인 이상에서는 메모리 절약이 CPU 적약에도 크게 영향을 미치기 시작한다. 

|DATA| LINES|	SHARED|	WALL TIME|	CPU %|	MEM USAGE|	HTTP REQUESTS|
|---|---|---|---|---|---|---|
|100|	true|	2:01:70|	70-79%|	213-217MB|	92191-98837|
|100|	false|	2:01:80|	74-75%|	224-232MB|	96851-98643|
|1000|	true|	2:01:60|	74-79%|	209-216MB|	98251-98806|
|1000|	false|	2:01:90|	75-77%|	333-339MB|	98069-98951|
|10000|	true|	2:01:70|	78-79%|	213-217MB|	97953-98735|
|10000|	false|	2:03:00|	80-83%|	1364-1400MB|	96816-98852|
|100000|	true|	2:02:20|	78-79%|	238-275MB|	98103-98540|
|100000|	false|	2:14:00|	120-124%|	8.3-9.1GB|	96003-97802|

- v0.30.0에서는 더 낮은 수치에서 CPU 사용량의 차이가 약 10-15% 였지만, 약 10k 데이터 라인에서 균등하게 시작되었고 100k에서 확실한 승자가 되었다. 
- CPU/메모리 데이터는 /usr/bin/time을 사용하여 가져왔다. 원시 데이터와 함께 요지를 참조하라. https://gist.github.com/MStoykov/1181cfa6f00bc56b90915155f885e2bb
- 이 숫자는 순전히 예시이다. 성능은 SharedArray에서 검색된 요소의 추가 처리에 의해 영향을 받을 수 있거나 출력이 사용 중이거나 여러 요소를 가져오는 경우 등에 영향을 받을 수 있다. 
- SharedArray에는 약간의 CPU 사용량이 있지만 10개 요소만 있는 주어진 상황에서는 무시할 수 있거나 100k 요소에 대한 메모리 사용량보다 더 문제가 될 수 있다. 
- 따라서 의심스러운 경우 몇 가지 벤치마크를 실행하고 사용 사례에 더 중요한 절충점을 결정해야 한다. 