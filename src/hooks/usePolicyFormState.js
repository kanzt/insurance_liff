import { useState, useEffect } from 'preact/hooks';

const STORAGE_KEY = 'insurance_liff_form_draft';

export function usePolicyFormState(setConfirmModal) {
  const [informerId, setInformerId] = useState(null);
  const [informerName, setInformerName] = useState('');
  const [categoryId, setCategoryId] = useState('motor');
  const [productId, setProductId] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [submissionType, setSubmissionType] = useState('quotation');
  const [quotationSubType, setQuotationSubType] = useState('new'); // 'new' | 'renewal'
  const [isPlateTransfer, setIsPlateTransfer] = useState(false);
  const [referenceInput, setReferenceInput] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('quotation_confirm');
  const [notes, setNotes] = useState('');
  const [policyStartDate, setPolicyStartDate] = useState('');
  const [policyExpiryDate, setPolicyExpiryDate] = useState('');
  const [submitAgentCode, setSubmitAgentCode] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [actualPaid, setActualPaid] = useState('');
  const [installmentMonths, setInstallmentMonths] = useState('1');
  const [brokerChannelId, setBrokerChannelId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [commissionPercent, setCommissionPercent] = useState('');
  const [taxRate, setTaxRate] = useState('10');
  const [policyNotes, setPolicyNotes] = useState('');
  const [duplicatePolicy, setDuplicatePolicy] = useState(null);
  const [isRedPlate, setIsRedPlate] = useState(false);
  
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  
  const [filesData, setFilesData] = useState({
    registration: [],
    oldPolicy: [],
    quotation: [],
    compQuotation: [],
    renewalNotice: [],
    workOrder: [],
    others: []
  });

  // Restore form state from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.informerId) setInformerId(data.informerId);
        if (data.informerName) setInformerName(data.informerName);
        if (data.categoryId) setCategoryId(data.categoryId.toString());
        else if (data.productId) setCategoryId(data.productId.toString());
        if (data.productId) setProductId(data.productId.toString());
        if (data.submissionType) setSubmissionType(data.submissionType);
        if (data.quotationSubType) setQuotationSubType(data.quotationSubType);
        if (data.isPlateTransfer !== undefined) setIsPlateTransfer(data.isPlateTransfer);
        if (data.referenceInput) setReferenceInput(data.referenceInput);
        if (data.endDate) setEndDate(data.endDate);
        if (data.enableReminder) setEnableReminder(data.enableReminder);
        if (data.reminderDate) setReminderDate(data.reminderDate);
        if (data.reminderType) setReminderType(data.reminderType);
        if (data.isRedPlate !== undefined) setIsRedPlate(data.isRedPlate);
        if (data.notes) setNotes(data.notes);
        if (data.policyStartDate) setPolicyStartDate(data.policyStartDate);
        if (data.policyExpiryDate) setPolicyExpiryDate(data.policyExpiryDate);
        if (data.submitAgentCode) setSubmitAgentCode(data.submitAgentCode);
        if (data.companyId) setCompanyId(data.companyId);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.premiumAmount) setPremiumAmount(data.premiumAmount);
        if (data.paymentMethodId) setPaymentMethodId(data.paymentMethodId);
        if (data.actualPaid) setActualPaid(data.actualPaid);
        if (data.brokerChannelId) setBrokerChannelId(data.brokerChannelId);
        if (data.commissionPercent) setCommissionPercent(data.commissionPercent);
        if (data.taxRate) setTaxRate(data.taxRate);
        if (data.policyNotes) setPolicyNotes(data.policyNotes);
        if (data.vehicleYear) setVehicleYear(data.vehicleYear);
        if (data.vehicleMake) setVehicleMake(data.vehicleMake);
        if (data.vehicleModel) setVehicleModel(data.vehicleModel);
      } catch (e) {
        console.error("Failed to restore form state:", e);
      }
    }
  }, []);

  // Save form state to localStorage on any change
  useEffect(() => {
    const stateToSave = {
      informerId,
      informerName,
      categoryId,
      productId,
      submissionType,
      quotationSubType,
      isPlateTransfer,
      referenceInput,
      endDate,
      enableReminder,
      reminderDate,
      reminderType,
      isRedPlate,
      notes,
      policyStartDate,
      policyExpiryDate,
      submitAgentCode,
      companyId,
      companyName,
      premiumAmount,
      policyNotes,
      paymentMethodId,
      actualPaid,
      installmentMonths,
      brokerChannelId,
      commissionPercent,
      taxRate,
      vehicleYear,
      vehicleMake,
      vehicleModel
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    informerId, informerName, categoryId, productId, submissionType, quotationSubType, isPlateTransfer, referenceInput, 
    endDate, enableReminder, reminderDate, reminderType, isRedPlate, notes, policyNotes, 
    policyStartDate, policyExpiryDate, submitAgentCode, companyId, companyName, 
    premiumAmount, paymentMethodId, actualPaid, installmentMonths, brokerChannelId, 
    commissionPercent, taxRate, vehicleYear, vehicleMake, vehicleModel
  ]);

  // Prevent "follow_case" if endDate is removed
  useEffect(() => {
    if (reminderType === 'follow_case' && !endDate) {
      setReminderType('quotation_confirm');
    }
  }, [endDate, reminderType]);

  // Disable reminder if submissionType is 'success'
  useEffect(() => {
    if (submissionType === 'success') {
      setEnableReminder(false);
      setReminderDate('');
    }
  }, [submissionType]);

  // Auto-calculate expiry date
  useEffect(() => {
    if (policyStartDate && !policyExpiryDate) {
      const start = new Date(policyStartDate);
      const expiry = new Date(start);
      expiry.setFullYear(start.getFullYear() + 1);
      setPolicyExpiryDate(expiry.toISOString().split('T')[0]);
    }
  }, [policyStartDate]);

  const handleReminderToggle = (e) => {
    setEnableReminder(e.target.checked);
    if (e.target.checked && endDate && !reminderDate) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - 60);
      setReminderDate(d.toISOString().split('T')[0]);
    } else if (!e.target.checked) {
      setReminderDate('');
    }
  };

  const handleSetReminderPreset = (daysBefore) => {
    if (!endDate) return;
    const d = new Date(endDate);
    d.setDate(d.getDate() - daysBefore);
    setReminderDate(d.toISOString().split('T')[0]);
    setEnableReminder(true);
    setReminderType('follow_case');
  };

  const handleReset = (showConfirm = true, defaultCategoryId = '') => {
    const performReset = () => {
      localStorage.removeItem(STORAGE_KEY);
      setInformerId(null);
      setInformerName('');
      setCategoryId(defaultCategoryId);
      setProductId('');
      setSubmissionType('quotation');
      setQuotationSubType('new');
      setIsPlateTransfer(false);
      setDuplicatePolicy(null);
      setIsRedPlate(false);
      setReferenceInput('');
      setEndDate('');
      setEnableReminder(false);
      setReminderDate('');
      setReminderType('quotation_confirm');
      setSelectedPolicy(null);
      setNotes('');
      setPolicyStartDate('');
      setPolicyExpiryDate('');
      setSubmitAgentCode('');
      setBrokerChannelId('');
      setCompanyId('');
      setCompanyName('');
      setCommissionPercent('');
      setTaxRate('10');
      setPolicyNotes('');
      setVehicleYear('');
      setVehicleMake('');
      setVehicleModel('');
      setFilesData({
        registration: [],
        oldPolicy: [],
        quotation: [],
        compQuotation: [],
        renewalNotice: [],
        workOrder: [],
        others: []
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (showConfirm && setConfirmModal) {
      setConfirmModal({
        title: 'ยืนยันการล้างข้อมูล',
        message: 'คุณต้องการล้างข้อมูลในฟอร์มทั้งหมดใช่หรือไม่? ข้อมูลที่กรอกไว้จะหายไปทั้งหมด',
        onConfirm: performReset
      });
      return;
    }

    performReset();
  };

  const handleSelectPolicy = (policy) => {
    setSelectedPolicy(policy);
    if (policy) {
      const plate = policy.plateNumber || policy.plate_number;
      const customer = policy.customerName || policy.customer_name;
      const catId = policy.categoryId || policy.category_id;
      const subCatId = policy.productId || policy.product_id;
      const agentCode = policy.agentCode || policy.agent_code;
      const agentName = policy.agentName || policy.agent_name;
      const expiry = policy.policyExpiryDate || policy.policy_expiry_date || policy.expiryDate || policy.expiry_date || policy.previous_policy_expiry_date;
      const reminder = policy.reminderDate || policy.reminder_date;
      const rType = policy.reminderType || policy.reminder_type;
      const notesVal = policy.notes;
      const vYear = policy.vehicleYear || policy.vehicle_year;
      const vMake = policy.vehicleMake || policy.vehicle_make;
      const vModel = policy.vehicleModel || policy.vehicle_model;


      if (plate && plate !== 'ป้ายแดง') {
        setIsRedPlate(false);
        setReferenceInput(plate);
      } else if (plate === 'ป้ายแดง') {
        setIsRedPlate(true);
        setReferenceInput(customer || '');
      } else {
        setReferenceInput(customer || '');
      }

      if (catId) setCategoryId(catId.toString());
      if (subCatId) setProductId(subCatId.toString());
      
      if (vYear) setVehicleYear(vYear.toString());
      if (vMake) setVehicleMake(vMake.toString());
      if (vModel) setVehicleModel(vModel.toString());

      if (agentCode && agentName) {
        setInformerId(agentCode);
        setInformerName(agentName);
      }

      if (reminder) {
        setReminderDate(reminder);
        setEnableReminder(true);
        if (rType) setReminderType(rType);
      } else {
        setReminderDate('');
        setEnableReminder(false);
      }

      setEndDate(expiry || '');
      setNotes(notesVal || '');
      setIsPlateTransfer(false);
    }
  };


  const handlePlateTransfer = () => {
    setIsPlateTransfer(true);
    setQuotationSubType('new');
    setVehicleYear('');
    setVehicleMake('');
    setVehicleModel('');
    setDuplicatePolicy(null);
    setSelectedPolicy(null);
    setNotes(prev => {
      const tag = '[หมายเหตุ: สลับป้ายทะเบียนจากคันเดิม]';
      if (!prev) return tag;
      if (prev.includes(tag)) return prev;
      return `${tag}\n${prev}`;
    });
  };

  const handleCancelPlateTransfer = () => {
    setIsPlateTransfer(false);
    setNotes(prev => (prev || '').replace(/\[หมายเหตุ: สลับป้ายทะเบียนจากคันเดิม\]\n?/g, '').trim());
  };

  const handleCategoryChange = (newCatId) => {
    setCategoryId(newCatId);
    setProductId('');
    setQuotationSubType('new');
    setIsPlateTransfer(false);
    setDuplicatePolicy(null);
    setIsRedPlate(false);
    setReferenceInput('');
    setEndDate('');
    setEnableReminder(false);
    setReminderDate('');
    setReminderType('quotation_confirm');
    setSelectedPolicy(null);
    setNotes('');
    setPolicyStartDate('');
    setPolicyExpiryDate('');
    setSubmitAgentCode('');
    setBrokerChannelId('');
    setCompanyId('');
    setCompanyName('');
    setPremiumAmount('');
    setPaymentMethodId('');
    setActualPaid('');
    setInstallmentMonths('');
    setSelectedPaymentMethod(null);
    setCommissionPercent('');
    setTaxRate('10');
    setPolicyNotes('');
    setVehicleYear('');
    setVehicleMake('');
    setVehicleModel('');
    setFilesData({
      registration: [],
      oldPolicy: [],
      quotation: [],
      compQuotation: [],
      renewalNotice: [],
      workOrder: [],
      others: []
    });
  };

  return {
    state: {
      informerId,
      informerName,
      categoryId,
      productId,
      selectedPolicy,
      submissionType,
      quotationSubType,
      isPlateTransfer,
      referenceInput,
      endDate,
      enableReminder,
      reminderDate,
      reminderType,
      notes,
      policyStartDate,
      policyExpiryDate,
      submitAgentCode,
      companyId,
      companyName,
      premiumAmount,
      paymentMethodId,
      actualPaid,
      installmentMonths,
      brokerChannelId,
      selectedPaymentMethod,
      commissionPercent,
      taxRate,
      policyNotes,
      isRedPlate,
      duplicatePolicy,
      filesData,
      vehicleYear,
      vehicleMake,
      vehicleModel,
    },
    setters: {
      setInformerId,
      setInformerName,
      setCategoryId,
      setProductId,
      setSelectedPolicy,
      setSubmissionType,
      setQuotationSubType,
      setIsPlateTransfer,
      setReferenceInput,
      setEndDate,
      setEnableReminder,
      setReminderDate,
      setReminderType,
      setNotes,
      setPolicyStartDate,
      setPolicyExpiryDate,
      setSubmitAgentCode,
      setCompanyId,
      setCompanyName,
      setPremiumAmount,
      setPaymentMethodId,
      setActualPaid,
      setInstallmentMonths,
      setBrokerChannelId,
      setSelectedPaymentMethod,
      setCommissionPercent,
      setTaxRate,
      setPolicyNotes,
      setIsRedPlate,
      setDuplicatePolicy,
      setFilesData,
      setVehicleYear,
      setVehicleMake,
      setVehicleModel,
    },
    actions: {
      handleReminderToggle,
      handleSetReminderPreset,
      handleReset,
      handleSelectPolicy,
      handlePlateTransfer,
      handleCancelPlateTransfer,
      handleCategoryChange,
    }
  };
}

