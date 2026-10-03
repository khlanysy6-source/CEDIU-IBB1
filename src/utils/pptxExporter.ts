/**
 * PowerPoint Presentation Exporter
 * Generates an executive PPTX presentation with project indicators and pathways.
 */

import pptxgen from 'pptxgenjs';
import { Initiative } from '../types';

export async function exportToPowerPoint(
  initiatives: Initiative[],
  stats: any,
  slides: any[] = [],
  pathways: any[] = []
): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.rtlMode = true;

  // Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0f172a' };

  slide1.addText('منصة المبادرات المجتمعية لمشاريع الطرق بمحافظة إب', {
    x: 0.5,
    y: 1.5,
    w: '90%',
    h: 1.2,
    fontSize: 28,
    bold: true,
    color: '38bdf8',
    align: 'center'
  });

  slide1.addText('العرض التنفيذي للمسار الثاني وإدارة النتائج والحوكمة', {
    x: 0.5,
    y: 2.8,
    w: '90%',
    h: 0.8,
    fontSize: 18,
    color: 'cbd5e1',
    align: 'center'
  });

  slide1.addText(`إجمالي المبادرات المعتمدة: ${initiatives.length} مبادرة | محافظة إب © 2026`, {
    x: 0.5,
    y: 4.5,
    w: '90%',
    h: 0.6,
    fontSize: 14,
    color: '94a3b8',
    align: 'center'
  });

  // Overview / Stats Slide
  const slide2 = pptx.addSlide();
  slide2.addText('المؤشرات القيادية للمنظومة', {
    x: 0.8,
    y: 0.5,
    w: '80%',
    h: 0.8,
    fontSize: 22,
    bold: true,
    color: '0f172a'
  });

  const total = initiatives.length;
  const completed = initiatives.filter(i => i.status === 'completed' || Number(i.completionRate) >= 95).length;
  const ongoing = initiatives.filter(i => i.status === 'ongoing').length;
  const stagnant = initiatives.filter(i => i.status === 'stagnant' || i.status === 'stopped').length;

  const statBoxes = [
    { label: 'إجمالي المبادرات', val: `${total}` },
    { label: 'المبادرات المنجزة', val: `${completed}` },
    { label: 'المبادرات الجارية', val: `${ongoing}` },
    { label: 'المتعثرة والمتوقفة', val: `${stagnant}` }
  ];

  statBoxes.forEach((box, i) => {
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: 0.8 + i * 2.8,
      y: 1.8,
      w: 2.5,
      h: 2.0,
      fill: { color: 'f8fafc' },
      line: { color: 'cbd5e1', width: 1 }
    });
    slide2.addText(box.val, {
      x: 0.8 + i * 2.8,
      y: 2.0,
      w: 2.5,
      h: 0.8,
      fontSize: 26,
      bold: true,
      color: '0284c7',
      align: 'center'
    });
    slide2.addText(box.label, {
      x: 0.8 + i * 2.8,
      y: 2.8,
      w: 2.5,
      h: 0.8,
      fontSize: 13,
      bold: true,
      color: '475569',
      align: 'center'
    });
  });

  // Slides from data if provided
  if (Array.isArray(slides) && slides.length > 0) {
    slides.forEach(s => {
      const slide = pptx.addSlide();
      slide.addText(s.title || 'محور العرض', {
        x: 0.8,
        y: 0.6,
        w: '85%',
        h: 0.8,
        fontSize: 20,
        bold: true,
        color: '0f172a'
      });
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: 1.4,
          w: '85%',
          h: 0.6,
          fontSize: 14,
          color: '64748b'
        });
      }
      if (Array.isArray(s.points)) {
        slide.addText(
          s.points.map((p: string) => `• ${p}`).join('\n\n'),
          {
            x: 0.8,
            y: 2.2,
            w: '85%',
            h: 3.5,
            fontSize: 14,
            color: '334155'
          }
        );
      }
    });
  }

  // Pathways Slides
  if (Array.isArray(pathways) && pathways.length > 0) {
    const slidePath = pptx.addSlide();
    slidePath.addText('المسارات التنموية والميدانية', {
      x: 0.8,
      y: 0.6,
      w: '85%',
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: '0f172a'
    });

    pathways.slice(0, 4).forEach((p, idx) => {
      slidePath.addText(`${idx + 1}. ${p.title || 'مسار تنموي'}: ${p.subtitle || ''}`, {
        x: 0.8,
        y: 1.6 + idx * 1.0,
        w: '85%',
        h: 0.8,
        fontSize: 14,
        bold: true,
        color: '1e293b'
      });
    });
  }

  await pptx.writeFile({ fileName: `عرض_مبادرات_محافظة_إب_${Date.now()}.pptx` });
}
