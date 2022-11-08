import exec from 'k6/execution';

export default function () {
  const tag = exec.vu.tags['scenario'];
  console.log(tag); // INFO[0000] default            source=console 가 출력됨 
}