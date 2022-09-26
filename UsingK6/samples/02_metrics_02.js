import http from 'k6/http';
import { Trend } from 'k6/metrics'

const myTrend = new Trend('waiting_time');

export default function() {
  const res = http.get(`http://httpbin.test.k6.io`);
  myTrend.add(res.timings.waiting);

  console.log('MyTrend : ' + myTrend.name);
}