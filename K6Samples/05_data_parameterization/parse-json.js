import { SharedArray } from 'k6/data';
// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const data = new SharedArray('some data name', function () {
  return JSON.parse(open('./data.json')).users;
});

export default function () {
  const user = data[0];
  console.log(data[0].username);
}
