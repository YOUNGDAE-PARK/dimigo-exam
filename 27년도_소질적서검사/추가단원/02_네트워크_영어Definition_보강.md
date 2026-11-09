# 추가단원 02. 네트워크 영어 Definition 보강

> **이 단원의 목적**: 영어 지문 문제에서 네트워크 관련 용어가 나왔을 때 당황하지 않도록, 기존 영어 Definition 통합본에 없는 **네트워크 필수 용어**를 보강합니다. 영어 지문에는 대개 용어 설명이 함께 나오므로, 아래 **핵심 동사(밑줄 친 의미)** 만 알아도 정답을 찾을 수 있습니다.

---

## 1. 네트워크 장비 영어 Definition

| 용어 | 영어 정의 | 핵심 뜻 (한 줄 요약) |
| :--- | :--- | :--- |
| **Switch**<br>(스위치) | A networking device that **connects devices within the same network (LAN)** and forwards data **only to the intended device** by using MAC addresses. | 같은 네트워크(LAN) 안의 기기를 연결하고, 데이터를 **목적지 기기에만** 전달 |
| **Hub**<br>(허브) | A simple networking device that **sends incoming data to all connected devices**, without checking the destination. | 받은 데이터를 **연결된 모든 기기에 뿌림** (스위치보다 비효율적) |
| **Router**<br>(라우터) | A device that **forwards data packets between different networks** by choosing the best path using IP addresses. | **서로 다른 네트워크 사이**에서 IP 주소를 보고 **최적 경로** 선택 |
| **Access Point (AP)**<br>(무선 공유기) | A device that **lets wireless devices connect to a wired network** using Wi-Fi. | 무선(Wi-Fi) 기기를 유선 네트워크에 연결 |
| **Firewall**<br>(방화벽) | A security system that **monitors and controls incoming and outgoing network traffic** based on security rules. | 정해진 보안 규칙에 따라 **들어오고 나가는 통신을 감시·차단** |
| **Proxy Server**<br>(프록시 서버) | A server that **acts as an intermediary** between a user and the Internet. | 사용자와 인터넷 사이에서 **대신 요청을 전달(중간 다리)** |
| **Modem**<br>(모뎀) | A device that **converts digital signals into signals for transmission lines** (and back). | 디지털 신호 ↔ 통신선 신호 **변환** |

---

## 2. 주소 · 통신 개념 영어 Definition

| 용어 | 영어 정의 | 핵심 뜻 (한 줄 요약) |
| :--- | :--- | :--- |
| **IP Address**<br>(IP 주소) | A **unique numerical address** that identifies a device on a network. | 네트워크에서 기기를 식별하는 **고유 숫자 주소** (논리적 주소) |
| **MAC Address**<br>(맥 주소) | A **unique hardware address** assigned to a network device by its manufacturer. | 제조 시 부여되는 **기기 고유의 하드웨어 주소** (물리적 주소) |
| **Packet**<br>(패킷) | A **small unit of data** into which a message is divided for transmission over a network. | 전송을 위해 메시지를 **잘게 쪼갠 데이터 조각** |
| **Protocol**<br>(프로토콜) | A **set of rules** that defines how data is exchanged between devices. | 기기끼리 데이터를 주고받는 **약속(규칙)** |
| **Server / Client**<br>(서버 / 클라이언트) | A **server provides** services or data, and a **client requests** them. | 서버는 **제공**하고, 클라이언트는 **요청**함 |
| **Bandwidth**<br>(대역폭) | The **maximum amount of data** that can be transmitted over a connection in a given time. | 일정 시간 동안 전송할 수 있는 **최대 데이터량** |
| **Latency**<br>(지연 시간) | The **time delay** between sending a request and receiving a response. | 요청을 보내고 응답을 받기까지 **걸리는 시간** |
| **Wi-Fi**<br>(와이파이) | A **wireless networking technology** that connects devices to the Internet using radio waves. | 전파를 이용한 **무선 네트워크 기술** |

---

## 3. 혼동하기 쉬운 짝 비교

| 비교 | 차이점 |
| :--- | :--- |
| **IP Address vs MAC Address** | IP 주소는 **네트워크 위치에 따라 바뀔 수 있는 논리적 주소**이고, MAC 주소는 **기기에 고정된 물리적 주소**입니다. (IP = 주소 변경 가능한 '현재 주소', MAC = 변하지 않는 '주민등록번호') |
| **Hub vs Switch** | 허브는 **모든 기기에 전달**하고, 스위치는 **목적지 기기에만 전달**합니다. |
| **Switch vs Router** | 스위치는 **같은 네트워크(LAN) 안**을 연결하고, 라우터는 **서로 다른 네트워크 사이**를 연결합니다. |
| **DNS vs IP Address** | DNS는 **도메인 이름을 IP 주소로 바꿔 주는 시스템**이고, IP 주소는 그 결과로 얻는 **숫자 주소**입니다. |
| **Bandwidth vs Latency** | 대역폭은 **한 번에 보낼 수 있는 양**(도로 폭), 지연 시간은 **도착까지 걸리는 시간**(도로 길이)입니다. |

---

## 4. 영어 지문 해석 팁

* **동사에 주목하세요.**

| 영어 동사 | 의미 | 연결되는 용어 |
| :--- | :--- | :--- |
| `translate` | 변환하다 | DNS |
| `forward` | 전달하다 | Router, Switch |
| `monitor / control` | 감시·통제하다 | Firewall |
| `act as an intermediary` | 중간 다리 역할을 하다 | Proxy Server |
| `identify` | 식별하다 | IP Address, MAC Address |
| `divide into` | ~로 나누다 | Packet |

* **모르는 단어가 있어도 괜찮습니다.** 영어 지문은 용어를 직접 설명해 주는 경우가 많으므로, 위 핵심 동사와 `within the same network` / `between different networks` / `all devices` / `intended device` 같은 **구분 표현**만 찾으면 정답이 보입니다.

---

## 5. 확인 문제

**[문제 1]** 다음 영문 설명이 가리키는 장비로 알맞은 것은?

> *"This device connects computers within the same network and sends data only to the intended device by using MAC addresses."*

① Hub  ② Switch  ③ Router  ④ Firewall  ⑤ Modem

**[정답] ②** **[해설]** `within the same network`(같은 네트워크 안)와 `only to the intended device`(목적지 기기에만)가 핵심 단서이므로 스위치입니다. 허브는 모든 기기에 전달합니다.

**[문제 2]** `MAC Address`와 `IP Address`에 대한 설명으로 **옳은** 것은?

① MAC 주소는 접속하는 네트워크에 따라 계속 바뀐다.  
② IP 주소는 제조사가 기기에 고정해서 부여한다.  
③ MAC 주소는 기기에 고정된 하드웨어 고유 주소이다.  
④ 두 주소는 이름만 다를 뿐 완전히 같은 개념이다.  
⑤ IP 주소는 도메인 이름을 영어 문장으로 바꾼 것이다.

**[정답] ③** **[해설]** MAC 주소는 제조 시 부여되는 물리적 고유 주소이고, IP 주소는 네트워크 위치에 따라 달라질 수 있는 논리적 주소입니다.

**[문제 3]** 다음 설명에 해당하는 용어를 차례대로 짝지은 것은?

> *(A) The time delay between sending a request and receiving a response.*  
> *(B) A security system that monitors and controls network traffic based on rules.*

① (A) Bandwidth - (B) Proxy  
② (A) Latency - (B) Firewall  
③ (A) Latency - (B) Router  
④ (A) Protocol - (B) Firewall  
⑤ (A) Bandwidth - (B) Router

**[정답] ②** **[해설]** (A) `time delay`는 지연 시간(Latency), (B) `monitors and controls ... traffic`은 방화벽(Firewall)입니다.

