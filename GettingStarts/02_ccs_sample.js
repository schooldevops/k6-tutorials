import http from 'k6/http'
import { sleep, group, check } from 'k6'
import { Counter, Trend } from 'k6/metrics';
import { htmlReport } from "./bundle.js";
import { textSummary } from "./index.js";

// A simple counter for http requests
export const requests = new Counter('http_reqs');
export const myTrend = new Trend('response_time');
export const tPS = new Counter('TPS');

export const options = {
  discardResponseBodies: false,
  noConnectionReuse: true,
  noVUConnectionReuse: true, 
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 5, // 200 RPS, since timeUnit is the default 1s
      duration: '5m',
      preAllocatedVUs: 2,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.10'], // http errors should be less than 5%
    //http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export default function main() {
  let response

  const vars = {}

  group('page_2 - https://sbc.stg-apaws.com/', function () {
    response = http.get('https://sbc.stg-apaws.com/', {
      headers: {
        'upgrade-insecure-requests': '1',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
    })
    sleep(1)
  })

  group('page_3 - https://sbc.stg-apaws.com/loginConfirm.do', function () {
    response = http.post(
      'https://sbc.stg-apaws.com/loginConfirm.do',
      {
        usrLgnId: 'MABC0001',
        usrLgnPw: 'SUPERADMIN1!',
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          origin: 'https://sbc.stg-apaws.com',
          'upgrade-insecure-requests': '1',
          'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
        },
      }
    )

    vars['pageNo1'] = response.html().find('input[name=pageNo]').first().attr('value')

    vars['apbcBdTagt1'] = response.html().find('input[name=apbcBdTagt]').first().attr('value')

    vars['searchType1'] = response.html().find('input[name=searchType]').first().attr('value')

    sleep(1)
  })

  group('page_4 - https://sbc.stg-apaws.com/APAA100_01.do', function () {
    response = http.post(
      'https://sbc.stg-apaws.com/APAA100_01.do',
      {
        seqApbcBd: '202206081939500000000644',
        pageNo: `${vars['pageNo1']}`,
        apbcBdType: `${vars['apbcBdTagt1']}`,
        searchType: `${vars['searchType1']}`,
        searchYn: `${vars['apbcBdTagt1']}`,
        apbcBdTagt: `${vars['apbcBdTagt1']}`,
        startDate: '2022-05-20',
        endDate: '2022-06-20',
        searchVal: `${vars['apbcBdTagt1']}`,
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          origin: 'https://sbc.stg-apaws.com',
          'upgrade-insecure-requests': '1',
          'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
        },
      }
    )
  })
  
  myTrend.add(response.timings.duration);
  const resOK = response.status === 200;
  tPS.add(resOK)

  const checkRes = check(response, {
    'status is 200': (r) => r.status === 200,
  });
}