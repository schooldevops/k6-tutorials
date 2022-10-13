# Fine tuning OS

- 대규모 테스트 스크립트를 로컬에서 실행할 때 사용자는 때때로 OS 내에서 테스트를 완료하는 데 필수한 수의 요청을 하지 못하는 한계가 있다. 
- 이 제한은 일반적으로 너무 많은 열린 파일 오류로 나타난다. 
- 이러한 제한은 변경되지 않은 경우 컴퓨터에서 로컬로 더 크거나 복잡한 테스트를 실행하기로 선택한 경우 심각한 병목 현상이 될 수 있다. 

- 이 아티클에서는 시스템에 OS의 한계를 검사하고, 조정하고, 더 큰 테스트를 위해 확장하는 방법을 보여준다. 

- 여기서 주목해야할 중요한 점은 이 기사에서 다루는 모든 내용은 적절한 주의를 기울여야 한다는 것이다. 
- OS 변경과 마찬가지로 시스템 설정을 특정 값으로 맹목적으로 변경하는 것은 권장하지 않는다. 
- 명확한 전후 관계를 보여주는 테스트 방법을 문서화해야 한다. 
- 예를 들어 MSL/TIME_WAIT 기간을 변경하기 전에 문제(오류 메시지, netstat, ss등)가 발생했는지 확인하고, 보수적으로 설정을 변경하고, 테스트를 실행하고, 개선사항을 기록하라. 
- 이렇게 하면 최적화의 효과를 측정하고 부정적인 부작용을 찾아내고 다양한 권장 값을 제시할 수 있다. 

<br/>

- 아래 수정 사항은 macOS Sierra 10.12 이상에서 테스트 되었다. 
- 이전 버젼을 사용중인 경우 이러한 설정을 변경하는 프로세스가 다를 수 있다. 

## Networking resource limit

- GNU/Linux, BSD 및 macOS와 같은 Unix 운영체제 계열은 시스템 안정성을 보호하기 위해 프로세스에서 사용할 수 있는 시스템 리소스의 양을 제한하는 기능이 있다. 
- 여기에는 메모리, CPU 시간 혹은 단일 프로세스가 관리할 수 있는 파일 오픈의 수가 포함된다. 

<br/>

- Unix에서는 네트워크 연결을 포함하여 모든 것이 파일이기 때문에 k6와 같이 네트워크를 많이 사용하는 응용 프로그램 테스트 도구는 특정 테스트에 사용된 네트워크 연결의 양에 따라 허용된 열린 파일의 구성된 제한에 도달할 수 있다.
- 이전에 언급했듯이 테스트 중에 다음 메시지가 표시될 수 있다. 

```js
WARN[0127] Request Failed     error="Get http://example.com/: dial tcp example.com: socket: too many open files"
```

- 이 메시지는 네트워크 리소스 제한에 도달했음을 의미하며, 이로 인해 k6가 새 연결을 생성하지 못하여 테스트 결과가 변경되었다.
- 예를 들어 전체 시스템 성능을 측정하기 위해 이것이 필요한 경우도 있지만 대부분의 경우 HTTP 서버와 웹 애플리케이션 자체를 테스트 하는데 병목이 밝생한다. 

- 아래에서 이 리소스 제한을 늘리고 k6가 단일 시스템에서 수백 또는 수천 개의 동시 VU로 테스트를 실행할 수 있도록 하는 방법을 살펴보자. 

#### Limit types

- 유닉스 시스템은 2가지 타입의 리소스 제한을 가진다. 
  - hard limits: 이것은 절대적인 각 사용자에게 허용된 최대값을 나타낸다. 그리고 root유저에 의해서만 설정이 가능하다. 
  - soft limits: 이것은 각 유저에 의해서 설정이 가능하다. 그러나 hard limit 설정을 넘어설 수 없다. 

### Viewing limits configuration

#### Linux

- GNU/Linux 에서 ulimit 커맨드를 이용하여 설정된 limit을 확인할 수 있다. 
- 'ulimit -Sa' 는 현재 사용자의 soft limit 를 보여준다. 

```js
ulimit -Sa
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 3736
max locked memory       (kbytes, -l) 16384
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 3736
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- 'ulimit -Ha' 은 현재 사용자에 대한 모든 hard limits를 보여준다. 

```js
ulimit -Ha
core file size          (blocks, -c) unlimited
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 3736
max locked memory       (kbytes, -l) 16384
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1048576
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) unlimited
cpu time               (seconds, -t) unlimited
max user processes              (-u) 3736
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- 열린 파일의 차이는 소프트 제한의 경우 최대 1024 이며, 하드 limit의 경우에는 1048576 이다. 

#### macOS

- 그러나 macOS에서는 고려해야 할 몇 가지 다른 시스템 제한이 있다. 
- 우선 소프트 제한 및 하드 제한으로도 지정된 프로세스당 제한을 인쇄하는 'launchctl limit maxfiles' 을 이용한다. 

```js
$ launchctl limit maxfiles
        maxfiles    65536          200000         
```

- 소프트 제한을 초과하면 프로세스가 신호를 수신할 수 있지만 (예: CPU 시간 또는 파일 크기가 초과된 경우) 하드 제한에 도달할 때까지 (또는 리소스 제한을 수정할 때까지) 실행을 계속할 수 있다. 
- 'kern.maxfiles' 전체 시스템의 전체 파일 설명자의 한계이다. 모든 프로세스에 대해 열려 있는 모든 파일과 커널이 자제 목적으로 연 모든 파일의 합계이다. 

```js
$ sysctl kern.maxfiles
kern.maxfiles: 200000
```

```js
$ sysctl kern.maxfilesperproc
kern.maxfilesperproc: 65536
```

- 따라서 반복해서 말하면 위의 명령을 실행하면 열린 파일과, 실행중인 프로세스에 대한 시스템 제한이 표시된다. 

### Changing limits configuration

- 구성을 변경하기 전에 가장 먼저 고려해야 할 사항은 테스트에 필요한 네트워크 연결의 양이다. 
- k6 결과 요약의 http_reqs 메트릭은 이를 암시할 수 있지만 최대 개수의 기준 계산이다.
- VU * (단일 VU 반복에서 HTTP 요청 수) 는 공정한 근사치를 제공한다. 
- k6은 "열린 파일" 할당량에 포함되는 테긋트 파일 및 기타 리소스도 처리하지만 네트워크 연결이 가장 큰 소비자이다. 

#### macOS

- macOS 에서 시스템이 부과한 제한을 변경하려면 먼저 보안 기능을 비활성화 해야한다.
- 특정 시스템 소유 파일 및 디렉토리가 적절한 권한 없이 프로세스에 의해 수정되는 것을 방지하려면 OS X El Capitan에 도입된 시스템 무결성 보호를 비활성화 해야한다. 

- 비활성화 하려면 Mac 을 재시동하고 부팅하는 동안 Command + R을 누르고 있어야한다. 그러면 복구 모드로 부팅된다. 
- 거기에서 Utilities 로 이동하여 터미널을 열어야한다. 그리고 다음 명령을 실행한다. 

```js
csrutil disable
```

- Enter 키를 누르고 터미널을 닫으면 Mac 을 정상적으로 재부팅하고 계정에 로그인할 수 있다. 

#### Changing soft limits

##### Linux

- 따라서 반복당 4개의 HTTP 요청을 수행하는 1000 VU 테스트를 실행하려고 한다고 가정해 보자. 
- 이 경우 추가 네트워크 이외의 파일 사용을 고려하여 열린 파일 제한을 5000으로 늘릴 수 있다. 
- 이것은 다음 명령으로 수행이 가능하다. 

```js
ulimit -n 5000
```

- 이렇게 하면 현재 셀 세션에 대한 제한만 변경된다. 
- 향후 세션에 대해 이 변경 사항을 유지하려면 이를 셀 시작 파일에 추가할 수 있다. 
- Bash 의 경우 다음과 같다. 

```js
echo "ulimit -n 5000" >> ~/.bashrc
```

##### macOS

- 소프트 제한이 너무 낮으면 현재 세션을 다음으로 설정한다. (여기에 기록된 값은 일반적으로 기본 값에 가깝다.)

```js
sudo launchctl limit maxfiles 65536 200000
```
- sudo 가 필요하므로 암호를 입력하라는 메시지가 표시된다. 

#### Changing hard limits

##### Linux

- 위 명령이 제한을 수정할 수 없음: 작업이 허용되지 않거나 값이 하드 제한을 초과함과 같은 오류가 발생하였다면 하드 제한이 너무 낮음을 의미하며 앞서 언급했듯이 루트 사용자만 변경할 수 있다. 

- 이것은 /etc/security/limits.conf 파일을 수정하여 수행이 가능하다. 
- 예를 들어 alice 계정에 대한 프로세스당 열린 파일 양의 소프트 및 하드 제한을 모두 설정하려면 선택한 텍스트 편집기에서 루트로 /etc/security/limits.conf를 열고 다음 행을 추가하라. 

```js
alice soft nofile 5000
alice hard nofile 1048576
```

- 새로운 한도는 로그아웃 했다가 다시 로그인하면 적용된다. 
- 다르게는 * hard nofile 1048576은 루트가 아닌 모든 사용자 계정에 대해 설정을 적용하고 루트 사용자에게는 root hard nofile 1048576을 적용한다. 
- ulimit 명령 문서는 해당 파일의 문서 또는 man bash 를 참조하라. 

##### macOS

- 다음 단계는 새 파일 제한을 구성하는 것이다. 
- 터미널을 열고 다음 명령을 붙여 넣는다. 

```js
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

- 그러면 터미널 창 내부에 텍스트 편집기가 열리고 사용자 암호를 제공하고 다음을 붙여 넣으라는 메시지가 표시된다. 

```js
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
 <dict>
 <key>Label</key>
 <string>limit.maxfiles</string>
 <key>ProgramArguments</key>
 <array>
 <string>launchctl</string>
 <string>limit</string>
 <string>maxfiles</string>
 <string>64000</string>
 <string>524288</string>
 </array>
 <key>RunAtLoad</key>
 <true/>
 <key>ServiceIPC</key>
 <false/>
 </dict>
</plist>

```

- Control + X를 누르면 변경 사항이 저장되고 편집기가 종료된다. 
- 이것을 붙여넣고 저장함으로써 maxfiles 제한에 두 가지 다른 제한이 도입되었다. 
- 첫번째 항목(64000)은 소프트 제한으로, 도달하면 Mac 에서 새 파일 열기 허용을 중지하지만 계속 열도록 준비하라는 메시지가 표시된다. 
- 두번째 제한인(524288)에 도달하면 오랜 친구인 '열린 파일이 너무 많다' 오류 메시지가 다시 표시되기 시작한다. 

- 다음에 동일한 절차를 사용하여 프로세스 제한을 늘릴 것이다. 
- 터미널에서 다음 명령을 사용하여 유사한 파일을 만든다. 

```js
sudo nano /Library/LaunchDaemons/limit.maxproc.plist
```

- 다시 암호를 입력하라는 메시지가 표시되면 다음을 붙여넣고 Control + X로 저장하고 닫을 수 있다. 

```js
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple/DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
 <plist version="1.0">
 <dict>
 <key>Label</key>
 <string>limit.maxproc</string>
 <key>ProgramArguments</key>
 <array>
 <string>launchctl</string>
 <string>limit</string>
 <string>maxproc</string>
 <string>2048</string>
 <string>4096</string>
 </array>
 <key>RunAtLoad</key>
 <true />
 <key>ServiceIPC</key>
 <false />
 </dict>
 </plist>
```

- 이 후에 남은 것은 Mac을 복구 모드로 다시 재부팅하고 터미널을 열고 csrutil enable로 SIP를 다시켜고 처음에 사용한 명령으로 제한이 변경되었는지 확인하는 것이다. 

- 대부분의 경우 이러한 제한은 대부분의 간단한 테스트를 잠시 동안 로컬에서 실행하기에 충분해야 하지만 위의 파일을 테스트에 필요한 값으로 수정할 수 있다. 

- Warning
  - 이러한 모든 제한 사항은 제대로 작성되지 않고 엄청난 양의 메모리 누수가 발생할 수 있는 파일 및 응용 프로그램으로 부터 운영 체제를 보호하기 위한 것이다. 
  - 값을 너무 많이 사용하지 않는 것이 좋다. 그렇지 않으면 RAM이 부족할 때 시스템 속도가 느려질 수 있다. 

### Local port range

- 나가는 네트워크 연결을 만들 때 커널은 사용가능한 포트 범위에서 연결을 위해 로컬(소스) 포트를 할당한다. 

#### GNU/Linux

- GNU/Linux 에서 범위를 다음을 통해 확인이 가능하다. 

```js
sysctl net.ipv4.ip_local_port_range net.ipv4.ip_local_port_range = 32768 60999
```

- 28,231 포트는 대부분의 케이스에서 충분하다. 
- 수천개의 연결로 테스트 하는 경우라면 이는 제한 요소가 된다. 
- 다음을 통해 늘릴 수 있다. 

```js
sysctl -w net.ipv4.ip_local_port_range="16384 65000"
```

- 이 값의 범위는 TCP와 UDP 모두에 적용되므로 신중하게 선택하고 필요에 따라 늘여야한다. 
- 변경 사항을 영구적으로 적용하려면 net.ipv4.ip_local_port_range=16384 65000을 /etc/sysctl.conf 에 추가하라. 
- 위 조정으로도 네트워크 문제가 지속적으로 발생하면 net.ipv4.tcp_tw_reuse 활성화를 고려하라. 

```js
sysctl -w net.ipv4.tcp_tw_reuse=1
```

- 이렇게 하면 기능이 TIME_WAIT 상태에서 연결을 빠르게 재 사용하여 잠재적으로 더 높은 처리량을 얻을 수 있다. 

#### macOS/Linux

- macOS에서는 기본적으로 포트 번호가 49152 ~ 65535 이다. 총 16383 포트이다. 
- sysctl 명령을 통해서 체크할 수 있다. 

```js
sysctl net.inet.ip.portrange.first net.inet.ip.portrange.last

net.inet.ip.portrange.first: 49152
net.inet.ip.portrange.last: 65535
```

- 임시 포트가 부족하면 일반적으로 특정 포트 번호를 재사용할 수 있을때까지 TIME_WAIT 상태가 만료될 때까지 (2*최대 세그먼트 수명) 을 기다려야한다. 
- Linux 및 Solaris 의 기본값인 32768에서 시작하도록 범위를 변경하여 포트 수를 두 배로 늘릴 수 있다. 
- (최대 포트 수는 65535이며 최대로 늘릴수는 없다.)

```js
sudo sysctl -w net.inet.ip.portrange.first=32768

net.inet.ip.portrange.first: 49152 -> 32768
```

- IANA가 지정한 공식 범위는 49152 ~ 65535 이며 일부 방화벽은 동적으로 할당된 포트가 해당 범위에 속한다고 가정할 수 있다. 
- 로컬 네트워크 외부의 더 넓은 범위를 사용하려면 방화벽을 다시 구성해야 할 수 있다. 

## General optimizations

- 이 섹션에서는 몇가지 최적화에 대해서 검토해볼 것이며, 이는 당신의 OS에 의존하지 않지만, 테스트에는 영향을 줄 수 있다. 

### RAM 사용

- 특정 k6 테스트에따라 사용된 최대 VU수, Javascript 종속성의 수 및 크기, 테스트 스크립트 자체의 복잡성에 따라 k6 는 테스트 실행 중에 많은 양의 시스템 RAM을 소모할 수 있다. 
- 개발은 RAM 사용량을 최대한 줄이는 데 중점을 두고 있지만 특정 시나리오에서는 단일 테스트 실행에 수십 기가바이트의 RAM이 사용될 수 있다. 

- 기준으로 스크립트 복잡성과 종속성에 따라 각 VU 인스턴스에 필요한 RAM이 1MB 에서 5MB 사이로 계산된다. 
- 이것은 대략 1,000 VU 테스트에 필요한 시스템 RAM 의 GB에서 5GB 사이이므로 테스트 요구 사항을 충족하기에 충분한 물리적 RAM 을 사용할 수 있는지 확인하라.

- RAM 사용량을 줄여야 하는 경우 --compatibility-mode=base 옵션을 사용할 수 있다. 
- Javascript 호환 모드에 대해서 자세히 알아보라. https://k6.io/docs/using-k6/javascript-compatibility-mode

### Virtual memory

- 물리적 RAM 외에도 더 높은 메모리 사용량 버스트가 필요한 경우 시스템이 적절한 양의 가상 메모리 또는 스왑 공간으로 구성되어 있는지 확인하라. 
- swapon 또는 free 명령을 사용하여 시스템에서 사용 가능한 스왑 공간의 상태와 양을 볼 수 있다. 
- 여기서 스왑 구성 세부 정보를 다루지는 않겠지만 온라인에서 여러 가이드를 찾을 수 있다. 

### Network performance

- k6는 많은 양의 네트워크 트래픽을 생성하고 유지할 수 있기 때문에 최신 운영 체제의 네트워크 스택에도 스트레스를 준다. 
- 특정 부하 또는 네트워크 조건에서 운영 체제의 일부 네트워크 설정을 조정하거나 테스트의 네트워크 조건을 재구성하여 더 높은 처리량과 더 나은 성능을 달성할 수 있다. 

### TCP TIME_WAIT period

- 웹 클라이언트 및 서버와 같은 TCP 네트워크 응용 프로그램에는 들어오거나 나가는 각 연결에 대해 네트워크 소켓 쌍(로컬주소, 로컬포트, 원격주소 및 원격 포트의 고유한 조합)이 할당된다. 
- 일반적으로 이 소켓 쌍은 단일 HTTP 요청/응답 세션에 사용된다. 그리고 이후 클로즈 된다. 
- 그러나 응용 프로그램에서 연결을 성공적으로 닫은 후에도 커널은 일치하는 새 TCP 세그먼트가 도착하면 동일한 소켓을 빠르게 다시 열기 위해 리소스를 예약할 수 있다. 
- 이것은 또한 전송 중에 일부 패킷이 손실되는 네트워크 혼잡 중에 발생한다. 
- 이것은 소켓을 TIME_WAIT 상태로 만들고 TIME_WAIT 기간이 만료되면 해제된다. 
- 이 기간은 일반적으로 15초에서 2분 사이로 구성된다. 

- k6와 같은 일부 응용 프로그램에서 발생할 수 있는 문제는 많은 수의 연결이 TIME_WAIT 상태로 끝나게 하여 새 네트워크 연결이 생성되지 못하게 하는 것이다. 
- 이러한 시나리오에서는 시스템 네트워크 구성을 변경하기 전에 다른 응용 프로그램에 부정적인 영향을 줄 수 있으므로 먼저 몇 가지 일반적인 테스트 예방 조치를 취하는 것이 좋다. (다른 서버 포트 또는 IP사용)

- 소켓은 로컬 주소, 로컬포트, 원격주소 및 원격 포트의 조합에 대해 고유하게 생성되기 때문에 TIME_WAIT 혼잡을 피하기 위한 안전한 해결 방법은 다른 서버 포트 또는 IP주소를 사용하는 것이다. 
- 에를 들어 포트 :8080, :8081, :8082 등에서 실행되도록 애플리케이션을 구성하고 이러한 엔드포인트에 HTTP 요청을 분산할 수 있다. 





