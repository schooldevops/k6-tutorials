import { findBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { check } from 'k6';
import http from 'k6/http';

export default function () {
  // This request returns XML:
  const res = http.get('https://httpbin.test.k6.io/xml');

  // Use findBetween to extract the first title encountered:
  const title = findBetween(res.body, '<title>', '</title>');

  check(title, {
    'title is correct': (t) => t === 'Wake up to WonderWidgets!',
  });
}
