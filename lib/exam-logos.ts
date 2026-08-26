export const examLogos: Record<string, string> = {
  SSC_CGL: '/ssclogo.jpg',
  RRB_NTPC: '/rrbntpclogo.jpg',
  RBI_GRADEB: '/rbilogo.jpg',
  NABARD_GRADEA: '/nabardlogo.jpg',
  SEBI_GRADEA: '/sebilogo.jpg',
  LIC_AAO: '/liclogo.jpg',
  UPSC_APFC: '/upsclogo.jpg',
  IRDA: '/irdailogo.jpg',
  UPSC_CSE: '/upsclogo.jpg',
  UPSC: '/upsclogo.jpg',
  SBI_PO: '/sbilogo.jpg',
  SBI: '/sbilogo.jpg',
  IBPS_PO: '/ibpslogo.jpg',
  IBPS: '/ibpslogo.jpg',
  ACIO2: '/upsclogo.jpg',
};

export function getExamLogo(examCode: string): string {
  if (!examCode) return '';
  const upper = examCode.toUpperCase();
  return (
    examLogos[upper] ||
    examLogos[upper.replace(/-/g, '_')] ||
    (upper.includes('UPSC') ? examLogos.UPSC_CSE : '') ||
    (upper.includes('SBI') ? examLogos.SBI_PO : '') ||
    (upper.includes('IBPS') ? examLogos.IBPS_PO : '') ||
    (upper.includes('SSC') ? examLogos.SSC_CGL : '') ||
    (upper.includes('RBI') ? examLogos.RBI_GRADEB : '') ||
    (upper.includes('RRB') ? examLogos.RRB_NTPC : '') ||
    (upper.includes('SEBI') ? examLogos.SEBI_GRADEA : '') ||
    (upper.includes('NABARD') ? examLogos.NABARD_GRADEA : '') ||
    (upper.includes('LIC') ? examLogos.LIC_AAO : '') ||
    (upper.includes('IRDA') ? examLogos.IRDA : '') ||
    ''
  );
}


