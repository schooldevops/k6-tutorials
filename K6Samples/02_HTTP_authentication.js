import encoding from 'k6/encoding';
import http from 'k6/http';
import { check } from 'k6';

// 로드 테스트에서 인증 방식을 어떻게 이용하는지 테스트한다. 

// 사용자 이름/비밀번호 설정 
const username = 'user';
const password = 'passwd';

// 테스트 함수 
export default function () {
  const credentials = `${username}:${password}`;

  // username과 password 를 URL의 부분으로 전달하며, HTTP Basic Auth 를 이용하여 인증을 수행한다. 
  const url = `https://${credentials}@httpbin.test.k6.io/basic-auth/${username}/${password}`;

  // url 로 요청을 조회한다. 
  let res = http.get(url);

  console.log(res)
  // 응답 검증하기 
  // 상태코드가 200인가 ?
  // authenticated 결과가 정상으로 수행되었는지 
  // 사용자 이름이 username이 맞는지 검사 
  check(res, {
    'status is 200': (r) => r.status === 200,
    'is authenticated': (r) => r.json().authenticated === true,
    'is correct user': (r) => r.json().user === username,
  });

  // 반대로 HTTP Basic Auth 를 이용하여 인증을 위하 자체적으로 헤더를 생성한다. 
  const encodedCredentials = encoding.b64encode(credentials);
  // 인증 헤더를 위한 옵션을 설정한다. 
  const options = {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
    },
  };

  // get 요청을 수행하며 기본 인증 코드를 사용하여 전달하도록 한다. 
  res = http.get(`https://httpbin.test.k6.io/basic-auth/${username}/${password}`, options);

  // 결과 검증 (httpbin.test.k6.io 로 부터 데이터를 에코받고 이를 검증한다. 이는 기본 인증을 사용한다.)
  check(res, {
    'status is 200': (r) => r.status === 200, // 인증 코드가 200인경우 
    'is authenticated': (r) => r.json().authenticated === true, // 인증되었는지 여부 
    'is correct user': (r) => r.json().user === username, // 사용자 이름이 올바른지 검사 
  });
}
