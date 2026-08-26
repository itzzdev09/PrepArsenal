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
  SBI_PO: '/sbilogo.jpg',
  IBPS_PO: '/ibpslogo.jpg',
};

export function getExamLogo(examCode: string) {
  return examLogos[examCode];
}
