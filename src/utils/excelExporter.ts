import ExcelJS from 'exceljs';
import { Initiative } from '../types';
import { parseNum } from './numberAndDistrictUtils';
import { analyzeInitiative } from './healthAndGapAnalysis';

/**
 * Professional multi-tab Excel (.xlsx) Exporter with RTL orientation,
 * custom column widths, styled headers, auto-totals, number formats, and colored status cells.
 */
export async function exportInitiativesToExcel(
  initiatives: Initiative[],
  filenamePrefix = 'تقرير_المبادرات_التنموية_الموحد'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'منظومة إدارة المبادرات التنموية - محافظة إب';
  workbook.created = new Date();

  // Color Palette constants
  const HEADER_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  };
  const HEADER_FONT: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };
  const TOTAL_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFECFDF5' } // Emerald 50
  };
  const TOTAL_FONT: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FF065F46' } // Emerald 800
  };
  const BORDER_THIN: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  // Helper to apply header styling
  const styleHeaderRow = (row: ExcelJS.Row) => {
    row.height = 28;
    row.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = BORDER_THIN;
    });
  };

  // Helper to format data cells
  const styleDataRow = (row: ExcelJS.Row, isEven: boolean) => {
    row.height = 22;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = BORDER_THIN;
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' } // Slate 50
        };
      }
    });
  };

  // =========================================================================
  // SHEET 1: الشيت الموحد للبيانات والكميات والأسمنت والديزل
  // =========================================================================
  const sheet1 = workbook.addWorksheet('1. الشيت الموحد الشامل', {
    views: [{ rightToLeft: true, showGridLines: true }]
  });

  sheet1.columns = [
    { header: 'م', key: 'idx', width: 6 },
    { header: 'رقم المبادرة', key: 'num', width: 14 },
    { header: 'اسم المبادرة / المشروع', key: 'name', width: 32 },
    { header: 'المديرية', key: 'district', width: 18 },
    { header: 'العزلة', key: 'subDistrict', width: 18 },
    { header: 'القرية', key: 'village', width: 18 },
    { header: 'القطاع', key: 'sector', width: 14 },
    { header: 'الحالة', key: 'status', width: 14 },
    { header: 'الإنجاز (%)', key: 'completionRate', width: 12 },
    { header: 'التكلفة الكلية (ر.ي)', key: 'cost', width: 18 },
    { header: 'مساهمة المجتمع (ر.ي)', key: 'communityContrib', width: 18 },
    { header: 'مساهمة الوحدة (ر.ي)', key: 'unitContrib', width: 18 },
    { header: 'أسمنت معتمد (كيس)', key: 'cementAppr', width: 16 },
    { header: 'أسمنت منصرف (كيس)', key: 'cementDisbursed', width: 16 },
    { header: 'أسمنت مستخدم (كيس)', key: 'cementUsed', width: 16 },
    { header: 'رصيد أسمنت بالوحدة (كيس)', key: 'cementUnitCredit', width: 18 },
    { header: 'أسمنت متبقي بالموقع (كيس)', key: 'cementRemaining', width: 18 },
    { header: 'ديزل معتمد (لتر)', key: 'dieselAppr', width: 16 },
    { header: 'ديزل منصرف (لتر)', key: 'dieselDisbursed', width: 16 },
    { header: 'ديزل مستخدم (لتر)', key: 'dieselUsed', width: 16 },
    { header: 'رصيد ديزل بالوحدة (لتر)', key: 'dieselUnitCredit', width: 18 },
    { header: 'ديزل متبقي بالموقع (لتر)', key: 'dieselRemaining', width: 18 },
    { header: 'طول دراسة (م)', key: 'lengthAppr', width: 14 },
    { header: 'طول منفذ (م)', key: 'lengthExec', width: 14 },
    { header: 'عرض دراسة (م)', key: 'widthAppr', width: 14 },
    { header: 'عرض منفذ (م)', key: 'widthExec', width: 14 },
    { header: 'رصف حجري دراسة (م²)', key: 'stonePavingAppr', width: 18 },
    { header: 'رصف حجري منفذ (م²)', key: 'stonePavingExec', width: 18 },
    { header: 'رصف خرساني دراسة (م²)', key: 'concretePavingAppr', width: 18 },
    { header: 'رصف خرساني منفذ (م²)', key: 'concretePavingExec', width: 18 },
    { header: 'شق وقطع دراسة (م³)', key: 'cutAppr', width: 16 },
    { header: 'شق وقطع منفذ (م³)', key: 'cutExec', width: 16 },
    { header: 'مباني حجر دراسة (م³)', key: 'stoneMasonryAppr', width: 16 },
    { header: 'مباني حجر منفذ (م³)', key: 'stoneMasonryExec', width: 16 },
    { header: 'مؤشر الصحة /100', key: 'healthScore', width: 14 },
    { header: 'الفئة التنموية الـ 5', key: 'fiveTier', width: 25 },
    { header: 'التوصية والتدخل الفوري', key: 'recommendation', width: 40 }
  ];

  styleHeaderRow(sheet1.getRow(1));

  initiatives.forEach((init, i) => {
    const analysis = analyzeInitiative(init);
    const appr = init.approvedStudyQuantities || {};
    const exec = init.executedWorkQuantities || {};

    const row = sheet1.addRow({
      idx: i + 1,
      num: init.initiativeNumber || `IM-${101 + i}`,
      name: init.name || '',
      district: init.district || '',
      subDistrict: init.subDistrict || '',
      village: init.village || '',
      sector: init.sector || 'طرق',
      status: init.status === 'completed' ? 'منجزة' : init.status === 'ongoing' ? 'مستمرة' : init.status === 'stagnant' ? 'متعثرة' : init.status === 'stopped' ? 'متوقفة' : 'تحت الدراسة',
      completionRate: parseNum(init.completionRate),
      cost: parseNum(init.cost),
      communityContrib: parseNum(init.communityContribution),
      unitContrib: parseNum(init.unitContribution),
      cementAppr: analysis.resourceEfficiency.cementAppr,
      cementDisbursed: analysis.resourceEfficiency.cementDisbursed,
      cementUsed: analysis.resourceEfficiency.cementUsed,
      cementUnitCredit: analysis.resourceEfficiency.cementUnitCreditBalance,
      cementRemaining: analysis.resourceEfficiency.cementRemaining,
      dieselAppr: analysis.resourceEfficiency.dieselAppr,
      dieselDisbursed: analysis.resourceEfficiency.dieselDisbursed,
      dieselUsed: analysis.resourceEfficiency.dieselUsed,
      dieselUnitCredit: analysis.resourceEfficiency.dieselUnitCreditBalance,
      dieselRemaining: analysis.resourceEfficiency.dieselRemaining,
      lengthAppr: parseNum(appr.lengthCompleted),
      lengthExec: parseNum(exec.lengthCompleted),
      widthAppr: parseNum(appr.avgWidth),
      widthExec: parseNum(exec.avgWidth),
      stonePavingAppr: parseNum(appr.stonePaving),
      stonePavingExec: parseNum(exec.stonePaving),
      concretePavingAppr: parseNum(appr.concretePaving),
      concretePavingExec: parseNum(exec.concretePaving),
      cutAppr: parseNum(appr.excavationCut),
      cutExec: parseNum(exec.excavationCut),
      stoneMasonryAppr: parseNum(appr.stoneMasonry),
      stoneMasonryExec: parseNum(exec.stoneMasonry),
      healthScore: analysis.healthScore,
      fiveTier: analysis.fiveTierClassification.shortTitle,
      recommendation: analysis.fiveTierClassification.interventionProposal
    });

    styleDataRow(row, i % 2 === 1);

    // Number formatting
    row.getCell('cost').numFmt = '#,##0';
    row.getCell('communityContrib').numFmt = '#,##0';
    row.getCell('unitContrib').numFmt = '#,##0';
    row.getCell('cementAppr').numFmt = '#,##0';
    row.getCell('cementDisbursed').numFmt = '#,##0';
    row.getCell('cementUsed').numFmt = '#,##0';
    row.getCell('cementUnitCredit').numFmt = '#,##0';
    row.getCell('cementRemaining').numFmt = '#,##0';
    row.getCell('dieselAppr').numFmt = '#,##0';
    row.getCell('dieselDisbursed').numFmt = '#,##0';
    row.getCell('dieselUsed').numFmt = '#,##0';
    row.getCell('dieselUnitCredit').numFmt = '#,##0';
    row.getCell('dieselRemaining').numFmt = '#,##0';
    row.getCell('completionRate').numFmt = '0"% "';
    row.getCell('healthScore').numFmt = '0';

    // Status coloring
    const statusCell = row.getCell('status');
    if (init.status === 'completed') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      statusCell.font = { color: { argb: 'FF065F46' }, bold: true };
    } else if (init.status === 'ongoing') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      statusCell.font = { color: { argb: 'FF1E40AF' }, bold: true };
    } else if (init.status === 'stagnant' || init.status === 'stopped') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      statusCell.font = { color: { argb: 'FF991B1B' }, bold: true };
    }
  });

  // Total Summary Row for Sheet 1
  const totalRowIndex1 = initiatives.length + 2;
  const totalRow1 = sheet1.addRow({
    idx: 'الإجمالي',
    name: `عدد المبادرات: ${initiatives.length}`,
    cost: { formula: `SUM(J2:J${totalRowIndex1 - 1})` },
    communityContrib: { formula: `SUM(K2:K${totalRowIndex1 - 1})` },
    unitContrib: { formula: `SUM(L2:L${totalRowIndex1 - 1})` },
    cementAppr: { formula: `SUM(M2:M${totalRowIndex1 - 1})` },
    cementDisbursed: { formula: `SUM(N2:N${totalRowIndex1 - 1})` },
    cementUsed: { formula: `SUM(O2:O${totalRowIndex1 - 1})` },
    cementUnitCredit: { formula: `SUM(P2:P${totalRowIndex1 - 1})` },
    cementRemaining: { formula: `SUM(Q2:Q${totalRowIndex1 - 1})` },
    dieselAppr: { formula: `SUM(R2:R${totalRowIndex1 - 1})` },
    dieselDisbursed: { formula: `SUM(S2:S${totalRowIndex1 - 1})` },
    dieselUsed: { formula: `SUM(T2:T${totalRowIndex1 - 1})` },
    dieselUnitCredit: { formula: `SUM(U2:U${totalRowIndex1 - 1})` },
    dieselRemaining: { formula: `SUM(V2:V${totalRowIndex1 - 1})` }
  });

  totalRow1.height = 26;
  totalRow1.eachCell((cell) => {
    cell.fill = TOTAL_FILL;
    cell.font = TOTAL_FONT;
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF059669' } },
      bottom: { style: 'double', color: { argb: 'FF059669' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // =========================================================================
  // SHEET 2: مصفوفة مقارنة كميات بنود الأعمال (الدراسة vs المنفذ الفعلي)
  // =========================================================================
  const sheet2 = workbook.addWorksheet('2. مقارنة كميات بنود الأعمال', {
    views: [{ rightToLeft: true, showGridLines: true }]
  });

  sheet2.columns = [
    { header: 'م', key: 'idx', width: 6 },
    { header: 'رقم المبادرة', key: 'num', width: 14 },
    { header: 'اسم المبادرة', key: 'name', width: 30 },
    { header: 'المديرية', key: 'district', width: 18 },
    { header: 'نسبة الإنجاز %', key: 'completionRate', width: 12 },
    { header: 'الطول المعتمد (م)', key: 'lengthAppr', width: 14 },
    { header: 'الطول المنفذ (م)', key: 'lengthExec', width: 14 },
    { header: 'فارق الطول (م)', key: 'lengthDiff', width: 14 },
    { header: 'العرض المعتمد (م)', key: 'widthAppr', width: 14 },
    { header: 'العرض المنفذ (م)', key: 'widthExec', width: 14 },
    { header: 'الشق والقطع معتمد (م³)', key: 'cutAppr', width: 16 },
    { header: 'الشق والقطع منفذ (م³)', key: 'cutExec', width: 16 },
    { header: 'التوسعة معتمدة (م³)', key: 'expAppr', width: 16 },
    { header: 'التوسعة منفذة (م³)', key: 'expExec', width: 16 },
    { header: 'الرصف الحجري معتمد (م²)', key: 'stonePavingAppr', width: 18 },
    { header: 'الرصف الحجري منفذ (م²)', key: 'stonePavingExec', width: 18 },
    { header: 'فارق الرصف الحجري (م²)', key: 'stonePavingDiff', width: 18 },
    { header: 'الرصف الخرساني معتمد (م²)', key: 'concretePavingAppr', width: 18 },
    { header: 'الرصف الخرساني منفذ (م²)', key: 'concretePavingExec', width: 18 },
    { header: 'مباني الحجر معتمد (م³)', key: 'stoneMasonryAppr', width: 16 },
    { header: 'مباني الحجر منفذ (م³)', key: 'stoneMasonryExec', width: 16 }
  ];

  styleHeaderRow(sheet2.getRow(1));

  initiatives.forEach((init, i) => {
    const appr = init.approvedStudyQuantities || {};
    const exec = init.executedWorkQuantities || {};

    const lAppr = parseNum(appr.lengthCompleted);
    const lExec = parseNum(exec.lengthCompleted);
    const spAppr = parseNum(appr.stonePaving);
    const spExec = parseNum(exec.stonePaving);

    const row = sheet2.addRow({
      idx: i + 1,
      num: init.initiativeNumber || `IM-${101 + i}`,
      name: init.name || '',
      district: init.district || '',
      completionRate: parseNum(init.completionRate),
      lengthAppr: lAppr,
      lengthExec: lExec,
      lengthDiff: lExec - lAppr,
      widthAppr: parseNum(appr.avgWidth),
      widthExec: parseNum(exec.avgWidth),
      cutAppr: parseNum(appr.excavationCut),
      cutExec: parseNum(exec.excavationCut),
      expAppr: parseNum(appr.expansion),
      expExec: parseNum(exec.expansion),
      stonePavingAppr: spAppr,
      stonePavingExec: spExec,
      stonePavingDiff: spExec - spAppr,
      concretePavingAppr: parseNum(appr.concretePaving),
      concretePavingExec: parseNum(exec.concretePaving),
      stoneMasonryAppr: parseNum(appr.stoneMasonry),
      stoneMasonryExec: parseNum(exec.stoneMasonry)
    });

    styleDataRow(row, i % 2 === 1);

    row.getCell('completionRate').numFmt = '0"% "';
    row.getCell('lengthAppr').numFmt = '#,##0';
    row.getCell('lengthExec').numFmt = '#,##0';
    row.getCell('lengthDiff').numFmt = '#,##0';
    row.getCell('stonePavingAppr').numFmt = '#,##0';
    row.getCell('stonePavingExec').numFmt = '#,##0';
    row.getCell('stonePavingDiff').numFmt = '#,##0';
    row.getCell('concretePavingAppr').numFmt = '#,##0';
    row.getCell('concretePavingExec').numFmt = '#,##0';
  });

  // =========================================================================
  // SHEET 3: تتبع حركة ومخزون الأسمنت والديزل والرصيد لدى الوحدة
  // =========================================================================
  const sheet3 = workbook.addWorksheet('3. تتبع الأسمنت والديزل والرصيد', {
    views: [{ rightToLeft: true, showGridLines: true }]
  });

  sheet3.columns = [
    { header: 'م', key: 'idx', width: 6 },
    { header: 'رقم المبادرة', key: 'num', width: 14 },
    { header: 'اسم المبادرة', key: 'name', width: 30 },
    { header: 'المديرية', key: 'district', width: 18 },
    { header: 'نسبة الإنجاز %', key: 'completionRate', width: 12 },
    { header: 'الأسمنت المعتمد (كيس)', key: 'cementAppr', width: 18 },
    { header: 'الأسمنت المنصرف (كيس)', key: 'cementDisbursed', width: 18 },
    { header: 'الأسمنت المستهلك بالموقع (كيس)', key: 'cementUsed', width: 20 },
    { header: 'رصيد الأسمنت لدى الوحدة (كيس)', key: 'cementUnitCredit', width: 22 },
    { header: 'الأسمنت المتبقي بمخزن المبادرة (كيس)', key: 'cementRemaining', width: 22 },
    { header: 'الديزل المعتمد (لتر)', key: 'dieselAppr', width: 18 },
    { header: 'الديزل المنصرف (لتر)', key: 'dieselDisbursed', width: 18 },
    { header: 'الديزل المستهلك بالموقع (لتر)', key: 'dieselUsed', width: 20 },
    { header: 'رصيد الديزل لدى الوحدة (لتر)', key: 'dieselUnitCredit', width: 22 },
    { header: 'الديزل المتبقي بموقع المبادرة (لتر)', key: 'dieselRemaining', width: 22 },
    { header: 'موقف كفاءة الاستهلاك والحفظ', key: 'patternLabel', width: 28 }
  ];

  styleHeaderRow(sheet3.getRow(1));

  initiatives.forEach((init, i) => {
    const analysis = analyzeInitiative(init);

    const row = sheet3.addRow({
      idx: i + 1,
      num: init.initiativeNumber || `IM-${101 + i}`,
      name: init.name || '',
      district: init.district || '',
      completionRate: parseNum(init.completionRate),
      cementAppr: analysis.resourceEfficiency.cementAppr,
      cementDisbursed: analysis.resourceEfficiency.cementDisbursed,
      cementUsed: analysis.resourceEfficiency.cementUsed,
      cementUnitCredit: analysis.resourceEfficiency.cementUnitCreditBalance,
      cementRemaining: analysis.resourceEfficiency.cementRemaining,
      dieselAppr: analysis.resourceEfficiency.dieselAppr,
      dieselDisbursed: analysis.resourceEfficiency.dieselDisbursed,
      dieselUsed: analysis.resourceEfficiency.dieselUsed,
      dieselUnitCredit: analysis.resourceEfficiency.dieselUnitCreditBalance,
      dieselRemaining: analysis.resourceEfficiency.dieselRemaining,
      patternLabel: analysis.resourceEfficiency.patternLabel
    });

    styleDataRow(row, i % 2 === 1);

    row.getCell('completionRate').numFmt = '0"% "';
    row.getCell('cementAppr').numFmt = '#,##0';
    row.getCell('cementDisbursed').numFmt = '#,##0';
    row.getCell('cementUsed').numFmt = '#,##0';
    row.getCell('cementUnitCredit').numFmt = '#,##0';
    row.getCell('cementRemaining').numFmt = '#,##0';
    row.getCell('dieselAppr').numFmt = '#,##0';
    row.getCell('dieselDisbursed').numFmt = '#,##0';
    row.getCell('dieselUsed').numFmt = '#,##0';
    row.getCell('dieselUnitCredit').numFmt = '#,##0';
    row.getCell('dieselRemaining').numFmt = '#,##0';

    // Highlight cases with remaining field cement > 0
    if (analysis.resourceEfficiency.cementRemaining > 0) {
      const remCell = row.getCell('cementRemaining');
      remCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      remCell.font = { color: { argb: 'FF991B1B' }, bold: true };
    }
  });

  // Total Summary Row for Sheet 3
  const totalRowIndex3 = initiatives.length + 2;
  const totalRow3 = sheet3.addRow({
    idx: 'الإجمالي',
    name: `عدد المبادرات: ${initiatives.length}`,
    cementAppr: { formula: `SUM(F2:F${totalRowIndex3 - 1})` },
    cementDisbursed: { formula: `SUM(G2:G${totalRowIndex3 - 1})` },
    cementUsed: { formula: `SUM(H2:H${totalRowIndex3 - 1})` },
    cementUnitCredit: { formula: `SUM(I2:I${totalRowIndex3 - 1})` },
    cementRemaining: { formula: `SUM(J2:J${totalRowIndex3 - 1})` },
    dieselAppr: { formula: `SUM(K2:K${totalRowIndex3 - 1})` },
    dieselDisbursed: { formula: `SUM(L2:L${totalRowIndex3 - 1})` },
    dieselUsed: { formula: `SUM(M2:M${totalRowIndex3 - 1})` },
    dieselUnitCredit: { formula: `SUM(N2:N${totalRowIndex3 - 1})` },
    dieselRemaining: { formula: `SUM(O2:O${totalRowIndex3 - 1})` }
  });

  totalRow3.height = 26;
  totalRow3.eachCell((cell) => {
    cell.fill = TOTAL_FILL;
    cell.font = TOTAL_FONT;
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF059669' } },
      bottom: { style: 'double', color: { argb: 'FF059669' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // =========================================================================
  // SHEET 4: مصفوفة تصنيف الحالات واقتراح القرارات والحلول القيادية
  // =========================================================================
  const sheet4 = workbook.addWorksheet('4. مصفوفة تصنيف الحالات والحلول', {
    views: [{ rightToLeft: true, showGridLines: true }]
  });

  sheet4.columns = [
    { header: 'م', key: 'idx', width: 6 },
    { header: 'رمز الفئة', key: 'fiveKey', width: 22 },
    { header: 'عنوان الفئة التنموية', key: 'fiveTitle', width: 28 },
    { header: 'رقم المبادرة', key: 'num', width: 14 },
    { header: 'اسم المبادرة', key: 'name', width: 30 },
    { header: 'المديرية', key: 'district', width: 18 },
    { header: 'العزلة', key: 'subDistrict', width: 18 },
    { header: 'نسبة الإنجاز %', key: 'completionRate', width: 12 },
    { header: 'التكلفة الكلية (ر.ي)', key: 'cost', width: 18 },
    { header: 'مساهمة الوحدة (ر.ي)', key: 'unitContrib', width: 18 },
    { header: 'أسمنت منصرف (كيس)', key: 'cementDisbursed', width: 18 },
    { header: 'أسمنت مستخدم (كيس)', key: 'cementUsed', width: 18 },
    { header: 'رصيد بالوحدة (كيس)', key: 'cementUnitCredit', width: 18 },
    { header: 'متبقي بالموقع (كيس)', key: 'cementRemaining', width: 18 },
    { header: 'التشخيص التنموي الفني', key: 'definition', width: 45 },
    { header: 'مقترح التدخل الفوري وفق أسس التنمية', key: 'proposal', width: 45 }
  ];

  styleHeaderRow(sheet4.getRow(1));

  initiatives.forEach((init, i) => {
    const analysis = analyzeInitiative(init);
    const five = analysis.fiveTierClassification;

    const row = sheet4.addRow({
      idx: i + 1,
      fiveKey: five.key,
      fiveTitle: five.shortTitle,
      num: init.initiativeNumber || `IM-${101 + i}`,
      name: init.name || '',
      district: init.district || '',
      subDistrict: init.subDistrict || '',
      completionRate: parseNum(init.completionRate),
      cost: parseNum(init.cost),
      unitContrib: parseNum(init.unitContribution),
      cementDisbursed: analysis.resourceEfficiency.cementDisbursed,
      cementUsed: analysis.resourceEfficiency.cementUsed,
      cementUnitCredit: analysis.resourceEfficiency.cementUnitCreditBalance,
      cementRemaining: analysis.resourceEfficiency.cementRemaining,
      definition: five.description,
      proposal: five.interventionProposal
    });

    styleDataRow(row, i % 2 === 1);

    row.getCell('cost').numFmt = '#,##0';
    row.getCell('unitContrib').numFmt = '#,##0';
    row.getCell('completionRate').numFmt = '0"% "';
    row.getCell('cementDisbursed').numFmt = '#,##0';
    row.getCell('cementUsed').numFmt = '#,##0';
    row.getCell('cementUnitCredit').numFmt = '#,##0';
    row.getCell('cementRemaining').numFmt = '#,##0';

    // Color code 5-tier titles
    const titleCell = row.getCell('fiveTitle');
    if (five.key === 'needs_intervention_unused_disbursed') {
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      titleCell.font = { color: { argb: 'FF991B1B' }, bold: true };
    } else if (five.key === 'active_needs_next_tranche') {
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      titleCell.font = { color: { argb: 'FF1E40AF' }, bold: true };
    } else if (five.key === 'completed_with_unit_credit') {
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFBF1' } };
      titleCell.font = { color: { argb: 'FF115E59' }, bold: true };
    } else if (five.key === 'fully_completed_and_disbursed') {
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      titleCell.font = { color: { argb: 'FF065F46' }, bold: true };
    }
  });

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
