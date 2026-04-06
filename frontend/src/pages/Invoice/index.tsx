import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Form, Input, Select, DatePicker, InputNumber, message, Space, Divider, Modal, Typography } from 'antd';
import { UnorderedListOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { createInvoice, getProductPrice } from '../../api/invoice';
import { getAllCustomers } from '../../api/customer';
import { getAllProducts } from '../../api/product';
import { useAuthStore } from '../../store/useAuthStore';

const { Text } = Typography;

interface ProductRow {
  productId?: number;
  productPrice?: number;
  productNum?: number;
  productMoney?: number;
}

const InvoiceList = () => {
  const [customers, setCustomers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const lastValuesRef = useRef<any>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 出库产品列表
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  // 运费区域是否展示
  const [showShipping, setShowShipping] = useState(false);

  // 出库总金额（只读）
  const [productTotalMoney, setProductTotalMoney] = useState(0);
  // 总金额（只读）
  const [totalMoney, setTotalMoney] = useState(0);

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadProducts();
    // 设置默认开票人为当前用户
    if (user?.userName) {
      form.setFieldValue('operater', user.userName);
    }
    // 恢复上次填写的内容
    if (lastValuesRef.current) {
      const saved = lastValuesRef.current;
      form.setFieldsValue({
        customerId: saved.customerId,
        invoiceTime: saved.invoiceTime,
        operater: saved.operater,
        comment: saved.comment,
        isFreeShipping: saved.isFreeShipping,
        shippingFee: saved.shippingFee,
      });
      if (saved.productRows) {
        setProductRows(saved.productRows);
      }
      if (saved.showShipping) {
        setShowShipping(true);
      }
    }
  }, []);

  // 计算出库总金额
  const recalcTotals = useCallback((rows: ProductRow[], shippingVisible?: boolean) => {
    const productTotal = rows.reduce((sum, row) => sum + (row.productMoney || 0), 0);
    setProductTotalMoney(productTotal);

    const isShippingVisible = shippingVisible !== undefined ? shippingVisible : showShipping;
    const isFreeShipping = form.getFieldValue('isFreeShipping');
    const shippingFee = form.getFieldValue('shippingFee') || 0;

    let total = productTotal;
    if (isShippingVisible && isFreeShipping === false && shippingFee > 0) {
      // 客户付运费，运费计入总金额
      total += shippingFee;
    }
    setTotalMoney(total);
  }, [showShipping, form]);

  // 自动查询单价（使用函数式更新避免闭包旧值问题）
  const fetchProductPrice = async (rowIndex: number, customerId: number, productId: number) => {
    try {
      const res = await getProductPrice(customerId, productId);
      if (res.data != null) {
        const price = res.data;
        setProductRows(prevRows => {
          const newRows = [...prevRows];
          newRows[rowIndex] = { ...newRows[rowIndex], productPrice: price };
          if (newRows[rowIndex].productNum) {
            newRows[rowIndex].productMoney = price * newRows[rowIndex].productNum!;
          }
          recalcTotals(newRows);
          return newRows;
        });
      }
    } catch {
      // 查不到价格，不处理
    }
  };

  // 产品选择变化
  const handleProductChange = (rowIndex: number, productId: number) => {
    setProductRows(prevRows => {
      const newRows = [...prevRows];
      newRows[rowIndex] = { ...newRows[rowIndex], productId, productPrice: undefined, productMoney: undefined };
      recalcTotals(newRows);
      return newRows;
    });

    const customerId = form.getFieldValue('customerId');
    if (customerId && productId) {
      fetchProductPrice(rowIndex, customerId, productId);
    }
  };

  // 客户变化时，重新查询所有已选产品的单价
  const handleCustomerChange = (customerId: number) => {
    setProductRows(prevRows => {
      prevRows.forEach((row, index) => {
        if (row.productId && customerId) {
          fetchProductPrice(index, customerId, row.productId);
        }
      });
      return prevRows;
    });
  };

  // 单价变化
  const handlePriceChange = (rowIndex: number, price: number | null) => {
    const newRows = [...productRows];
    newRows[rowIndex] = { ...newRows[rowIndex], productPrice: price || undefined };
    if (price && newRows[rowIndex].productNum) {
      newRows[rowIndex].productMoney = price * newRows[rowIndex].productNum!;
    }
    setProductRows(newRows);
    recalcTotals(newRows);
  };

  // 数量变化
  const handleNumChange = (rowIndex: number, num: number | null) => {
    const newRows = [...productRows];
    newRows[rowIndex] = { ...newRows[rowIndex], productNum: num || undefined };
    if (num && newRows[rowIndex].productPrice) {
      newRows[rowIndex].productMoney = newRows[rowIndex].productPrice! * num;
    }
    setProductRows(newRows);
    recalcTotals(newRows);
  };

  // 手动修改出库金额（弹出警告）
  const handleMoneyChange = (rowIndex: number, money: number | null) => {
    Modal.warning({ title: '提示', content: '用户正在修改出库金额' });
    const newRows = [...productRows];
    newRows[rowIndex] = { ...newRows[rowIndex], productMoney: money || undefined };
    setProductRows(newRows);
    recalcTotals(newRows);
  };

  // 添加产品行
  const addProductRow = () => {
    const newRows = [...productRows, {}];
    setProductRows(newRows);
  };

  // 删除产品行
  const removeProductRow = (index: number) => {
    const newRows = productRows.filter((_, i) => i !== index);
    setProductRows(newRows);
    recalcTotals(newRows);
  };

  // 运费/承担方变化时重算总金额
  const handleShippingChange = () => {
    setTimeout(() => recalcTotals(productRows), 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();

      // check: 产品列表不能为空
      if (productRows.length === 0) {
        message.warning('请至少添加一个出库产品');
        return;
      }

      // check: 每个产品行必须完整
      for (const row of productRows) {
        if (!row.productId) {
          message.warning('请选择所有出库产品');
          return;
        }
        if (!row.productNum || row.productNum <= 0) {
          message.warning('请填写所有产品的数量');
          return;
        }
      }

      // 构建提交数据
      const submitData: any = {
        customerId: values.customerId,
        invoiceTime: values.invoiceTime,
        operater: values.operater,
        comment: values.comment,
        products: productRows.map(row => ({
          productId: row.productId,
          productPrice: row.productPrice,
          productNum: row.productNum,
          productMoney: row.productMoney,
        })),
      };

      if (showShipping) {
        submitData.isFreeShipping = values.isFreeShipping;
        submitData.shippingFee = values.shippingFee;
      }

      await createInvoice(submitData);
      message.success('提交成功');

      // 保留上次填写的内容
      lastValuesRef.current = {
        ...values,
        productRows: [...productRows],
        showShipping,
      };
    } catch (error: any) {
      if (error?.errorFields) return;
      // 后端返回的 check 错误（如客户未注册、产品未注册）
      const errorMessage = error?.message || '提交失败';
      if (errorMessage.includes('客户未注册')) {
        Modal.warning({
          title: '该客户未注册，请先注册',
          content: <Link to="/admin" onClick={() => Modal.destroyAll()}>注册</Link>,
        });
      } else if (errorMessage.includes('产品未注册')) {
        Modal.warning({
          title: '该产品未注册，请先注册',
          content: <Link to="/admin" onClick={() => Modal.destroyAll()}>注册</Link>,
        });
      } else {
        message.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>新建出库发票</h1>
        <Button icon={<UnorderedListOutlined />} onClick={() => navigate('/query?tab=invoice')}>查看历史记录</Button>
      </div>

      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
          {/* 客户 */}
          <Form.Item name="customerId" label="客户（客户姓名 - 客户地址）" rules={[{ required: true, message: '请选择客户' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择客户"
              options={customers.map((c: any) => ({ value: c.customerId, label: c.customerName + ' - ' + c.customerAddress }))}
              onChange={handleCustomerChange}
            />
          </Form.Item>

          {/* 开票日期 */}
          <Form.Item name="invoiceTime" label="开票日期" rules={[{ required: true, message: '请选择开票日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {/* 开票人 */}
          <Form.Item name="operater" label="开票人" rules={[{ required: true, message: '请输入开票人' }]}>
            <Input placeholder="默认为当前登录用户" />
          </Form.Item>

          <Divider orientation="left">出库产品</Divider>

          {/* 产品列表 */}
          {productRows.map((row, index) => (
            <Card key={index} size="small" style={{ marginBottom: 12, background: '#fafafa' }}>
              <Space align="start" wrap style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>产品</Text>
                  <Select
                    style={{ width: 200 }}
                    showSearch
                    optionFilterProp="label"
                    placeholder="选择产品"
                    value={row.productId}
                    options={products.map((p: any) => ({
                      value: p.productId,
                      label: `${p.productName} ${p.productVolume} ${p.productSize}`,
                    }))}
                    onChange={(val) => handleProductChange(index, val)}
                  />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>单价</Text>
                  <InputNumber
                    style={{ width: 120 }}
                    min={0}
                    precision={2}
                    placeholder="自动查询"
                    value={row.productPrice}
                    onChange={(val) => handlePriceChange(index, val)}
                  />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>数量</Text>
                  <InputNumber
                    style={{ width: 100 }}
                    min={1}
                    precision={0}
                    placeholder="数量"
                    value={row.productNum}
                    onChange={(val) => handleNumChange(index, val)}
                  />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>出库金额</Text>
                  <InputNumber
                    style={{ width: 120 }}
                    min={0}
                    precision={2}
                    placeholder="自动计算"
                    value={row.productMoney}
                    onChange={(val) => handleMoneyChange(index, val)}
                  />
                </div>
                <MinusCircleOutlined
                  style={{ color: '#ff4d4f', fontSize: 20, marginTop: 24, cursor: 'pointer' }}
                  onClick={() => removeProductRow(index)}
                />
              </Space>
            </Card>
          ))}

          <Button type="dashed" onClick={addProductRow} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            添加出库产品
          </Button>

          {/* 出库总金额 */}
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f0f5ff', borderRadius: 6 }}>
            <Text strong>出库总金额：</Text>
            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>¥{productTotalMoney.toFixed(2)}</Text>
          </div>

          <Divider orientation="left">运费</Divider>

          {/* 运费区域 */}
          {!showShipping ? (
            <Button type="dashed" onClick={() => { setShowShipping(true); recalcTotals(productRows, true); }} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
              添加运费
            </Button>
          ) : (
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Space align="start" wrap>
                <Form.Item name="isFreeShipping" label="是否生产商出运费" initialValue={true} style={{ marginBottom: 0 }}>
                  <Select style={{ width: 160 }} onChange={handleShippingChange} options={[{ value: true, label: '是（生产商出）' }, { value: false, label: '否（客户出）' }]} />
                </Form.Item>
                <Form.Item name="shippingFee" label="运费金额" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} precision={2} style={{ width: 150 }} onChange={handleShippingChange} />
                </Form.Item>
                <MinusCircleOutlined
                  style={{ color: '#ff4d4f', fontSize: 20, marginTop: 30, cursor: 'pointer' }}
                  onClick={() => { setShowShipping(false); form.setFieldsValue({ isFreeShipping: undefined, shippingFee: undefined }); recalcTotals(productRows, false); }}
                />
              </Space>
            </Card>
          )}

          {/* 备注 */}
          <Form.Item name="comment" label="备注">
            <Input.TextArea rows={2} maxLength={200} showCount placeholder="补废xx、赠送xx" />
          </Form.Item>

          {/* 总金额 */}
          <div style={{ marginBottom: 24, padding: '12px 16px', background: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591' }}>
            <Text strong style={{ fontSize: 16 }}>总金额：</Text>
            <Text strong style={{ color: '#fa8c16', fontSize: 20 }}>¥{totalMoney.toFixed(2)}</Text>
            {showShipping && form.getFieldValue('isFreeShipping') === false && (form.getFieldValue('shippingFee') || 0) > 0 && (
              <Text type="secondary" style={{ marginLeft: 12 }}>（含客户运费 ¥{(form.getFieldValue('shippingFee') || 0).toFixed(2)}）</Text>
            )}
          </div>

          <Form.Item>
            <Button type="primary" size="large" onClick={handleSubmit} loading={submitting}>提交出库发票</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InvoiceList;