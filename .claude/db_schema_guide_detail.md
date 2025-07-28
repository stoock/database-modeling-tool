
# DB 스키마 생성 및 명명/Description 상세 가이드 (SQL Server 2017)

---

## 1. 테이블 생성 기본 원칙

- 모든 객체명(테이블/컬럼/인덱스/제약조건) 대문자 사용
- 의미 있는 영문 컬럼명, 한글 Description 필수
- VARCHAR/NVARCHAR 등 문자열 컬럼은 length(길이) 반드시 지정
- INT/DECIMAL 등 데이터에 맞는 타입 명확히
- NULL/NOT NULL, DEFAULT 등 제약조건을 명확히 지정
- PK/UK/인덱스 등은 명명 규칙에 따라 작성

---

## 2. 시스템 속성(감사 컬럼) 필수

| 컬럼      | 타입            | NULL 여부   | 기본값           | 설명               |
|-----------|-----------------|------------|------------------|--------------------|
| REG_ID    | VARCHAR(25)     | NOT NULL   |                  | 등록자             |
| REG_DT    | DATETIME        | NOT NULL   | GETDATE()        | 등록일시           |
| CHG_ID    | VARCHAR(25)     | NULL       |                  | 수정자             |
| CHG_DT    | DATETIME        | NULL       |                  | 수정일시           |

- **REG_ID, REG_DT**는 항상 NOT NULL
- **CHG_ID, CHG_DT**는 NULL 허용
- CDC/최적성 테이블은 예외로 CHG_ID, CHG_DT 미포함 가능

#### ✅ 예시
```sql
CREATE TABLE [TABLE_NAME] (
    ...,
    [REG_ID] VARCHAR(25)  NOT NULL,
    [REG_DT] DATETIME     NOT NULL,
    [CHG_ID] VARCHAR(25)  NULL,
    [CHG_DT] DATETIME     NULL
);
ALTER TABLE [TABLE_NAME] ADD CONSTRAINT DF__TABLE_NAME__REG_DT DEFAULT GETDATE() FOR REG_DT;
```

---

## 3. 데이터 타입 규칙

- **영문/숫자만 저장 시**: VARCHAR(n)
- **한글/일본어 등 다국어 저장 시**: NVARCHAR(n) 필수  
  (ex: 이름, 주소, 메모 등)
- VARCHAR(n): n바이트 (영문 n자 저장)
- NVARCHAR(n): n*2바이트 (모든 문자 n자 저장)

#### 예시
| 타입             | 저장 가능 | 예시(5글자)         |
|------------------|-----------|---------------------|
| VARCHAR(100)     | 영문 100자| Hello → 5바이트     |
| NVARCHAR(100)    | 한글 100자| 안녕하세요 → 10바이트|

---

## 4. 명명 규칙 (대문자, 중복 방지, 확장성)

| 항목          | 명명 규칙 예시                                        |
|---------------|------------------------------------------------------|
| PK 제약조건   | PK__{테이블명}__{컬럼1}__{컬럼2}                      |
| Cluster 인덱스| CIDX__{테이블명}__{컬럼1} (PK가 Cluster 아니면)        |
| 일반 인덱스   | IDX__{테이블명}__{컬럼1}__{컬럼2}                     |
| Default       | DF__{테이블명}__{컬럼명}                              |

#### PK 컬럼명
- 반드시 테이블명+컬럼명 조합  
  (ex: CLAIM_REQUEST_MAIL_NO, AFFLT_LOGIN_HIST_HIST_NO)
- 단독명칭(`ID`, `SEQ_NO`, `HIST_NO` 등) 금지
- 테이블명이 길면 일관된 약어 사용  
- 종속(하위) 테이블은 상위 PK명 그대로 계승(`GD_NO` 등)

#### 약어(Abbreviation) 예시  
| 원어      | 축약  | 원어     | 축약  | 원어     | 축약  |
|-----------|-------|----------|-------|----------|-------|
| CUSTOMER  | CUST  | GRADE    | GRD   | HISTORY  | HIST  |
| REQUEST   | REQ   | RESPONSE | RESP  | DETAIL   | DTL   |
| SEQUENCE  | SEQ   | IDENTIFIER| ID   | PRODUCT  | PRD   |
| PAYMENT   | PAY   | REFUND   | RFND  | AMOUNT   | AMT   |
| CHANGE    | CHG   | BENEFIT  | BEN   | USER     | USR   |
| ORDER     | ORD   | STATUS   | STAT  | CONFIRM  | CONF  |

> ※ 위는 예시, 프로젝트 특성·팀 합의로 확장 가능

---

## 5. Description(설명) 작성 가이드

### 테이블 Description
- **상세 설명을 한글로 명확하게 입력**
- Description을 빈 값 또는 테이블명을 그대로 복사 금지

#### 예시
| 테이블명                                         | Description(좋은 예)                     |
|--------------------------------------------------|------------------------------------------|
| EJOP_ORDER_COMPLETE_LOG                          | 주문 체결 고도화 주문 데이터 완료 처리 결과 |
| STTL_BUYER_TAX_RECEIPT_QOO10_TICKET_SERVICE_FEE  | 티켓 Qoo10 서비스 수수료 영수증           |

### 컬럼 Description
- 컬럼 한글명 + 상세 설명(필요 시)  
- 한글컬럼명과 상세설명은 `||`(shift+\)로 구분
- 컬럼명을 그대로 쓰거나, 설명 없이 입력 금지

#### 예시
| 컬럼명               | Description(좋은 예)                                 |
|----------------------|------------------------------------------------------|
| PACK_NO              | 장바구니번호                                          |
| GD_SELL_PRICE        | 상품판매가격 || 실제로 판매되는 가격(등급 관련 정보)    |
| RESULT_CODE          | 처리결과코드 || 0:성공, -100:실패(사유1), -200:실패(사유2)|
| ORDER_PROCESS_TYPE   | 주문처리타입 || K:재고선점, Z:재배송전 프로세스       |

---

## 6. Description SQL 등록 예시

```sql
-- 테이블 설명
EXEC sys.sp_addextendedproperty
  @name = N'MS_Description',
  @value = N'주문 체결 고도화 주문 데이터 완료 처리 결과',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE',  @level1name = N'ejop_order_complete_log';
GO

-- 컬럼 설명
EXEC sys.sp_addextendedproperty
  @name = N'MS_Description',
  @value = N'장바구니번호',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE',  @level1name = N'ejop_order_complete_log',
  @level2type = N'COLUMN', @level2name = N'pack_no';
GO

-- 컬럼 상세 설명
EXEC sys.sp_addextendedproperty
  @name = N'MS_Description',
  @value = N'처리결과코드 || 0:성공, -100:실패(사유1), -200:실패(사유2)',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE',  @level1name = N'example_table',
  @level2type = N'COLUMN', @level2name = N'result_code';
GO
```

---

## 7. 인덱스 및 기타 설계 유의사항

- WHERE/JOIN/ORDER BY에 자주 쓰는 컬럼 위주로 인덱스 설계
- 인덱스 컬럼에 함수/가공(ISNULL, CONVERT 등) 금지
- LIKE 검색, 임시테이블, 테이블 변수 사용 최소화
- 컬럼 타입과 WHERE조건 타입 반드시 일치(형변환 금지)
- 생성 스크립트, 컬럼 comment, ERD 파일 등은 반드시 요청에 첨부

---

## 8. 예시 CREATE TABLE 전체

```sql
CREATE TABLE CUST_GRD_CHG_BEN_HIST (
    CUST_GRD_CHG_BEN_HIST_NO   INT           NOT NULL  COMMENT '등급변경혜택이력PK',
    USER_ID                    VARCHAR(20)   NOT NULL  COMMENT '회원ID',
    APPLY_DT                   DATETIME      NOT NULL  COMMENT '적용일시',
    REG_ID                     VARCHAR(25)   NOT NULL  COMMENT '등록자',
    REG_DT                     DATETIME      NOT NULL  COMMENT '등록일시',
    CHG_ID                     VARCHAR(25)   NULL      COMMENT '수정자',
    CHG_DT                     DATETIME      NULL      COMMENT '수정일시',
    CONSTRAINT PK__CUST_GRD_CHG_BEN_HIST__CUST_GRD_CHG_BEN_HIST_NO PRIMARY KEY (CUST_GRD_CHG_BEN_HIST_NO),
    CONSTRAINT DF__CUST_GRD_CHG_BEN_HIST__REG_DT DEFAULT GETDATE() FOR REG_DT
);
```

---

## 9. 추가 체크리스트

- [ ] 컬럼명/제약조건/인덱스/Description 모두 가이드 준수
- [ ] CDC 테이블 여부, 반영 환경(DEV/STG/REAL) 명확히 구분
- [ ] ERD 포함, 관련 SP(스토어드프로시저) 검수 요청 필요시 첨부
- [ ] Description/Comment 누락 또는 미흡시 반드시 보완

---

> 이 가이드는 자동화 툴, AI, 실무자 모두 활용 가능하도록 설계됨.  
> 팀 내 합의/기준 변경시 지속적으로 업데이트 요망.
