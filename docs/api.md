# LightERP 接口文档

## 1. 通用说明

### 1.1 基础信息
- 基础路径: `/api/v1`
- 认证方式: Session (登录后获取session，后续请求携带Cookie)
- 响应格式: JSON
- 字符编码: UTF-8

### 1.2 通用响应结构
```json
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {}
}

// 分页响应
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}

// 错误响应
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 1.3 权限说明
| 权限码 | 名称 | 说明 |
|--------|------|------|
| 0 | viewer | 浏览者，仅有查询权限 |
| 1 | admin | 管理员，有开票/货款/罚款/查询权限 |
| 2 | super | 超级管理员，拥有所有权限 |

### 1.4 通用校验规则
| 字段 | 规则 |
|------|------|
| 用户名 | 数字、字母、汉字组合，不为null |
| 用户账号 | 6-18位数字，不为null |
| 用户密码 | 6-18位数字、字母组合，不为null |
| 客户名字 | 数字、字母、汉字、.、@组合，不为null |
| 客户地址 | 数字、字母、汉字、.、-、/组合，不为null |
| 产品名 | 数字、字母、汉字、.、@、-组合，不为null |
| 净含量 | 数字、字母、.组合，数字先行，不为null |
| 规格 | 数字、字母组合，数字先行，不为null |
| 金额 | 不能为负数 |
| 数量 | 应为自然数 |
| 时间 | 开始时间 < 结束时间 |

---

## 2. 用户模块

### 2.1 用户登录
- **接口**: `POST /auth/login`
- **描述**: 用户登录
- **请求体**:
```json
{
  "userAccount": "123456",
  "password": "password123"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 123456789,
    "userName": "张三",
    "userAccount": "123456",
    "userStatus": 2
  }
}
```

### 2.2 用户注册
- **接口**: `POST /auth/register`
- **描述**: 用户注册
- **请求体**:
```json
{
  "userName": "张三",
  "userAccount": "123456",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **响应**: 返回用户信息

### 2.3 获取当前用户信息
- **接口**: `GET /auth/current`
- **描述**: 获取当前登录用户信息
- **响应**: 返回用户基本信息

### 2.4 用户下线
- **接口**: `POST /auth/logout`
- **描述**: 退出登录
- **响应**: 成功

### 2.5 修改个人信息
- **接口**: `PUT /user/profile`
- **描述**: 修改当前用户信息
- **请求体**:
```json
{
  "userName": "新用户名"
}
```

---

## 3. 后台管理 - 用户管理

### 3.1 用户列表查询
- **接口**: `GET /admin/user/list`
- **描述**: 分页查询用户列表
- **参数**:
  - `userName`: 用户名（模糊）
  - `userAccount`: 用户账号（模糊）
  - `userStatus`: 用户权限
  - `page`: 页码
  - `pageSize`: 每页条数
- **权限**: super

### 3.2 添加用户
- **接口**: `POST /admin/user`
- **描述**: 新增用户
- **请求体**:
```json
{
  "userName": "张三",
  "userAccount": "123456",
  "password": "password123",
  "userStatus": 0
}
```
- **权限**: super

### 3.3 编辑用户
- **接口**: `PUT /admin/user/{id}`
- **描述**: 编辑用户
- **请求体**:
```json
{
  "userName": "张三",
  "userPassword": "newpassword123",
  "userStatus": 1
}
```
- **权限**: super

### 3.4 删除用户
- **接口**: `DELETE /admin/user/{id}`
- **描述**: 逻辑删除用户
- **权限**: super

---

## 4. 后台管理 - 客户管理

### 4.1 客户列表查询
- **接口**: `GET /admin/customer/list`
- **描述**: 分页查询客户列表
- **参数**:
  - `customerName`: 客户名（模糊）
  - `customerAddress`: 客户地址（模糊）
  - `page`: 页码
  - `pageSize`: 每页条数
- **权限**: super/edit/delete

### 4.2 添加客户
- **接口**: `POST /admin/customer`
- **描述**: 新增客户
- **请求体**:
```json
{
  "customerName": "某某公司",
  "customerAddress": "某某市某某区",
  "customerPhone": "13800138000"
}
```
- **权限**: super

### 4.3 编辑客户
- **接口**: `PUT /admin/customer/{id}`
- **描述**: 编辑客户
- **权限**: super

### 4.4 删除客户
- **接口**: `DELETE /admin/customer/{id}`
- **描述**: 逻辑删除客户
- **权限**: super

### 4.5 客户模糊搜索（下拉框用）
- **接口**: `GET /admin/customer/search`
- **描述**: 根据输入模糊查询客户
- **参数**: `keyword`: 关键字

---

## 5. 后台管理 - 产品管理

### 5.1 产品列表查询
- **接口**: `GET /admin/product/list`
- **描述**: 分页查询产品列表
- **参数**:
  - `productName`: 产品名（模糊）
  - `productVolume`: 净含量
  - `productSize`: 规格
  - `productTag`: 特点（模糊）
  - `page`: 页码
  - `pageSize`: 每页条数
- **权限**: super/edit/delete

### 5.2 添加产品
- **接口**: `POST /admin/product`
- **描述**: 新增产品
- **请求体**:
```json
{
  "productName": "产品名称",
  "productVolume": "500ml",
  "productSize": "10*10",
  "productTag": "特点1;特点2"
}
```
- **权限**: super

### 5.3 编辑产品
- **接口**: `PUT /admin/product/{id}`
- **描述**: 编辑产品
- **权限**: super

### 5.4 删除产品
- **接口**: `DELETE /admin/product/{id}`
- **描述**: 逻辑删除产品
- **权限**: super

### 5.5 产品模糊搜索（下拉框用）
- **接口**: `GET /admin/product/search`
- **描述**: 根据输入模糊查询产品
- **参数**: `keyword`: 关键字

---

## 6. 后台管理 - 客户产品单价管理

### 6.1 单价列表查询
- **接口**: `GET /admin/price/list`
- **描述**: 分页查询客户产品单价
- **参数**:
  - `customerId`: 客户ID
  - `productId`: 产品ID
  - `effectiveDateStart`: 生效开始日期
  - `effectiveDateEnd`: 生效结束日期
  - `page`: 页码
  - `pageSize`: 每页条数

### 6.2 添加单价
- **接口**: `POST /admin/price`
- **描述**: 新增客户产品单价
- **请求体**:
```json
{
  "customerId": 123,
  "productId": 456,
  "price": 100.00,
  "effectiveDateStart": "2026-01-01",
  "effectiveDateEnd": "2026-12-31"
}
```
- **权限**: super

### 6.3 编辑单价
- **接口**: `PUT /admin/price/{id}`
- **描述**: 编辑客户产品单价
- **权限**: super

### 6.4 删除单价
- **接口**: `DELETE /admin/price/{id}`
- **描述**: 逻辑删除单价记录
- **权限**: super

---

## 7. 销售模块 - 出库发票

### 7.1 创建出库发票
- **接口**: `POST /sale/invoice`
- **描述**: 创建出库发票（包含产品和运费）
- **请求体**:
```json
{
  "customerId": 123,
  "invoiceTime": "2026-04-05",
  "operater": "开票人",
  "isFreeShipping": false,
  "shippingFee": 50.00,
  "comment": "备注",
  "products": [
    {
      "productId": 456,
      "productPrice": 10.00,
      "productNum": 100,
      "productMoney": 1000.00
    }
  ]
}
```
- **说明**: 产品出库金额若手动修改需弹出警告
- **权限**: admin/super

### 7.2 发票列表查询
- **接口**: `GET /sale/invoice/list`
- **描述**: 分页查询出库发票
- **参数**:
  - `customerId`: 客户ID
  - `customerName`: 客户名（模糊）
  - `invoiceTimeStart`: 开票开始日期
  - `invoiceTimeEnd`: 开票结束日期
  - `operater`: 开票人
  - `page`: 页码
  - `pageSize`: 每页条数

### 7.3 发票详情
- **接口**: `GET /sale/invoice/{id}/detail`
- **描述**: 获取发票详情（包含产品和运费）

### 7.4 编辑发票
- **接口**: `PUT /sale/invoice/{id}`
- **描述**: 编辑出库发票
- **权限**: admin/super

### 7.5 删除发票
- **接口**: `DELETE /sale/invoice/{id}`
- **描述**: 逻辑删除发票
- **权限**: admin/super

### 7.6 导出发票Excel
- **接口**: `GET /sale/invoice/{id}/export`
- **描述**: 导出单张发票到Excel
- **响应**: 文件流

---

## 8. 货款模块

### 8.1 录入货款
- **接口**: `POST /payment`
- **描述**: 录入客户货款
- **请求体**:
```json
{
  "customerId": 123,
  "payment": 1000.00,
  "paymentTime": "2026-04-05",
  "comment": "备注"
}
```
- **权限**: admin/super

### 8.2 货款列表查询
- **接口**: `GET /payment/list`
- **描述**: 分页查询货款记录
- **参数**:
  - `customerId`: 客户ID
  - `customerName`: 客户名（模糊）
  - `paymentTimeStart`: 付款开始日期
  - `paymentTimeEnd`: 付款结束日期
  - `page`: 页码
  - `pageSize`: 每页条数

### 8.3 编辑货款
- **接口**: `PUT /payment/{id}`
- **描述**: 编辑货款记录
- **权限**: admin/super

### 8.4 删除货款
- **接口**: `DELETE /payment/{id}`
- **描述**: 逻辑删除货款记录
- **权限**: admin/super

### 8.5 导出货款Excel
- **接口**: `GET /payment/export`
- **描述**: 导出Filter后的货款记录到Excel
- **响应**: 文件流

---

## 9. 罚款模块

### 9.1 录入罚款
- **接口**: `POST /penalty`
- **描述**: 录入客户罚款
- **请求体**:
```json
{
  "customerId": 123,
  "penalty": 100.00,
  "penaltyTime": "2026-04-05",
  "comment": "罚款原因"
}
```
- **权限**: admin/super

### 9.2 罚款列表查询
- **接口**: `GET /penalty/list`
- **描述**: 分页查询罚款记录
- **参数**:
  - `customerId`: 客户ID
  - `customerName`: 客户名（模糊）
  - `penaltyTimeStart`: 罚款开始日期
  - `penaltyTimeEnd`: 罚款结束日期
  - `page`: 页码
  - `pageSize`: 每页条数

### 9.3 编辑罚款
- **接口**: `PUT /penalty/{id}`
- **描述**: 编辑罚款记录
- **权限**: admin/super

### 9.4 删除罚款
- **接口**: `DELETE /penalty/{id}`
- **描述**: 逻辑删除罚款记录
- **权限**: admin/super

### 9.5 导出罚款Excel
- **接口**: `GET /penalty/export`
- **描述**: 导出Filter后的罚款记录到Excel
- **响应**: 文件流

---

## 10. 查询模块

### 10.1 出库产品记录查询
- **接口**: `GET /query/sale-product/list`
- **描述**: 出库产品记录查询（带总金额统计）
- **参数**:
  - `customerId`: 客户ID
  - `productId`: 产品ID
  - `invoiceTimeStart`: 开票开始日期
  - `invoiceTimeEnd`: 开票结束日期
  - `operater`: 开票人
  - `page`: 页码
  - `pageSize`: 每页条数
- **响应**:
```json
{
  "code": 200,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalMoney": 50000.00  // 不受分页影响
  }
}
```

### 10.2 导出出库产品Excel
- **接口**: `GET /query/sale-product/export`
- **描述**: 导出出库产品记录

### 10.3 客户对账查询
- **接口**: `GET /query/reconciliation`
- **描述**: 客户对账记录查询
- **参数**:
  - `customerId`: 客户ID（必填）
  - `startDate`: 开始日期
  - `endDate`: 结束日期
- **响应**:
```json
{
  "code": 200,
  "data": {
    "customerName": "某某公司",
    "invoices": [
      {
        "invoiceId": "SALE20260405...",
        "invoiceMoney": 1000.00,
        "shippingFee": 50.00,
        "isFreeShipping": false,
        "totalMoney": 1050.00,
        "invoiceTime": "2026-04-05"
      }
    ],
    "invoiceTotalMoney": 1050.00,
    "payments": [...],
    "paymentTotalMoney": 500.00,
    "penalties": [...],
    "penaltyTotalMoney": 100.00,
    "unpaidMoney": 650.00  // 罚款+发票+客户付运费-汇款
  }
}
```

### 10.4 导出对账Excel
- **接口**: `GET /query/reconciliation/export`
- **描述**: 导出客户对账记录

---

## 11. 可视化模块

### 11.1 Top10未付款客户
- **接口**: `GET /stats/top-unpaid-customers`
- **描述**: 获取Top10未付款金额最高的客户
- **响应**:
```json
{
  "code": 200,
  "data": [
    {
      "customerId": 123,
      "customerName": "某某公司",
      "unpaidMoney": 50000.00
    }
  ]
}
```

### 11.2 发票数量折线图
- **接口**: `GET /stats/invoice-chart`
- **描述**: 获取发票数量趋势图
- **参数**:
  - `type`: 日/周/月/年 (day/week/month/year)
  - `startDate`: 开始日期
  - `endDate`: 结束日期
- **响应**:
```json
{
  "code": 200,
  "data": [
    {"date": "2026-04-01", "count": 10},
    {"date": "2026-04-02", "count": 15}
  ]
}
```

---

## 12. 通用接口

### 12.1 获取客户列表（下拉框用）
- **接口**: `GET /common/customers`
- **描述**: 获取客户下拉列表

### 12.2 获取产品列表（下拉框用）
- **接口**: `GET /common/products`
- **描述**: 获取产品下拉列表

### 12.3 获取当前用户产品单价
- **接口**: `GET /common/price`
- **描述**: 根据客户ID和产品ID获取单价
- **参数**:
  - `customerId`: 客户ID
  - `productId`: 产品ID