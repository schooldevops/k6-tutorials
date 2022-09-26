import http from 'k6/http';

export default function() {
  
  for (let id = 1; id <= 100; id++) {
    http.get(`http://example.com/post/${id}`)
  }
  
}