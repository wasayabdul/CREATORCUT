import { CopyrightChecklistItem, CopyrightRiskLevel, CopyrightSafetyState, VideoMetadata } from '../types';

export const COPYRIGHT_LEGAL_NOTICE = `CreatorCut Copyright Notice:
CreatorCut helps users identify potential copyright risks and organize licensing information. It does not provide legal advice and cannot guarantee that any video is free from copyright claims, Content ID matches, takedowns or strikes. Users are responsible for ensuring that they own or have obtained the necessary rights and permissions for all content they publish.`;

export const INITIAL_CHECKLIST: CopyrightChecklistItem[] = [
  {
    id: 'chk-music',
    title: 'Music Usage Rights',
    category: 'music',
    description: 'Verify background music is original, CC-licensed, or accompanied by a valid commercial synchronization license.',
    status: 'pending',
    requiredForCommercial: true,
  },
  {
    id: 'chk-footage',
    title: 'Video Footage Ownership',
    category: 'footage',
    description: 'Confirm you recorded the video yourself, have model releases for recognizable people, or own a commercial stock license.',
    status: 'pending',
    requiredForCommercial: true,
  },
  {
    id: 'chk-images',
    title: 'Image & Graphic Licensing',
    category: 'images',
    description: 'Ensure any logos, static graphics, memes, or textures included in overlays have appropriate reuse permissions.',
    status: 'verified',
    requiredForCommercial: true,
  },
  {
    id: 'chk-fonts',
    title: 'Font & Asset Licensing',
    category: 'fonts',
    description: 'CreatorCut uses Google Fonts (Inter, Noto Nastaliq Urdu, Plus Jakarta Sans) licensed under Open Font License (OFL) for free commercial use.',
    status: 'verified',
    notes: 'OFL 1.1 Commercial Safe',
    requiredForCommercial: false,
  },
  {
    id: 'chk-commercial',
    title: 'Commercial-Use Permissions',
    category: 'commercial',
    description: 'Confirm rights allow monetization, client distribution, advertising, and broadcast if used for commercial purposes.',
    status: 'pending',
    requiredForCommercial: true,
  },
  {
    id: 'chk-attribution',
    title: 'Attribution Requirements',
    category: 'attribution',
    description: 'Check if any Creative Commons or royalty-free assets require credit in the video description or end credits.',
    status: 'pending',
    requiredForCommercial: false,
  },
];

export interface RiskAssessment {
  level: CopyrightRiskLevel;
  score: number; // 0 (safest) to 100 (highest risk)
  badgeText: string;
  badgeClass: string;
  warnings: string[];
  recommendations: string[];
  missingCount: number;
  pendingCount: number;
  verifiedCount: number;
}

export function evaluateCopyrightRisk(state: CopyrightSafetyState): RiskAssessment {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 15; // baseline prudent caution (scans cannot guarantee copyright status)

  // 1. Evaluate Audio Source
  if (state.audioDeclaration.sourceType === 'unknown') {
    riskScore += 40;
    warnings.push('Audio track source is marked as Unknown. High risk of Content ID detection and takedown.');
    recommendations.push('Replace audio with a verified CC0 / CC-BY track from CreatorCut Safe Music Library or specify your license proof.');
  } else if (state.audioDeclaration.sourceType === 'creative-commons') {
    riskScore += 10;
    if (state.audioDeclaration.attributionRequired && !state.audioDeclaration.attributionText) {
      riskScore += 15;
      warnings.push('Creative Commons audio requires credit, but attribution text is not yet set.');
      recommendations.push('Copy the standard attribution template and paste it in your video description.');
    }
  } else if (state.audioDeclaration.sourceType === 'licensed') {
    if (!state.audioDeclaration.licenseProof) {
      riskScore += 20;
      warnings.push('Audio marked as Licensed, but no license certificate or invoice reference is provided.');
      recommendations.push('Enter your license certificate number or purchase invoice to keep as audit proof.');
    }
  }

  // 2. Evaluate Video Source
  if (state.videoDeclaration.sourceType === 'unknown') {
    riskScore += 35;
    warnings.push('Video footage ownership is unconfirmed.');
    recommendations.push('Confirm whether footage was captured by you or purchased with a stock footage license.');
  } else if (state.videoDeclaration.sourceType === 'licensed' && !state.videoDeclaration.licenseProof) {
    riskScore += 15;
    warnings.push('Stock video footage license proof is missing.');
    recommendations.push('Attach or record your stock media order ID / URL for safe audit documentation.');
  }

  // 3. Evaluate Checklist
  let verifiedCount = 0;
  let pendingCount = 0;
  let missingCount = 0;

  for (const item of state.checklist) {
    if (item.status === 'verified') verifiedCount++;
    else if (item.status === 'pending') {
      pendingCount++;
      riskScore += 6;
    } else if (item.status === 'missing') {
      missingCount++;
      riskScore += 18;
      warnings.push(`Safety checklist failure: ${item.title} is marked as Missing.`);
    }
  }

  if (pendingCount > 0) {
    recommendations.push(`Review the ${pendingCount} pending items in the Copyright Safety Checklist prior to publishing.`);
  }

  // Determine categorical level
  let level: CopyrightRiskLevel = 'low';
  let badgeText = 'Low Risk';
  let badgeClass = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

  if (riskScore >= 60 || missingCount > 0 || state.audioDeclaration.sourceType === 'unknown') {
    level = 'high';
    badgeText = 'High Copyright Risk';
    badgeClass = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  } else if (riskScore >= 30 || pendingCount >= 2) {
    level = 'moderate';
    badgeText = 'Moderate Risk - Action Recommended';
    badgeClass = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  }

  return {
    level,
    score: Math.min(100, riskScore),
    badgeText,
    badgeClass,
    warnings,
    recommendations,
    missingCount,
    pendingCount,
    verifiedCount,
  };
}

/**
 * Generate comprehensive Copyright Audit & Safety Report
 */
export function generateCopyrightReportText(state: CopyrightSafetyState, metadata: VideoMetadata | null): string {
  const assessment = evaluateCopyrightRisk(state);
  const now = new Date().toISOString();

  let text = `======================================================================
CREATORCUT COPYRIGHT SAFETY & LICENSING AUDIT REPORT
Generated: ${now}
Clip Name: ${metadata?.name || 'Untitled Video'}
Clip Duration: ${(metadata?.duration || 0).toFixed(1)} seconds
======================================================================

LEGAL DISCLAIMER:
----------------------------------------------------------------------
${COPYRIGHT_LEGAL_NOTICE}

IMPORTANT: CreatorCut does not claim that automated scans can establish
copyright ownership or guarantee copyright-free content. This report
reflects user declarations and documented permissions.

======================================================================
1. RISK ASSESSMENT SUMMARY
======================================================================
Overall Risk Level: ${assessment.badgeText.toUpperCase()}
Risk Score: ${assessment.score}/100
Checklist Items: ${assessment.verifiedCount} Verified, ${assessment.pendingCount} Pending, ${assessment.missingCount} Missing

Warnings Detected:
${assessment.warnings.length === 0 ? '- None detected.' : assessment.warnings.map(w => `- [!] ${w}`).join('\n')}

Recommended Actions:
${assessment.recommendations.length === 0 ? '- All standard permissions documented.' : assessment.recommendations.map(r => `- [→] ${r}`).join('\n')}

======================================================================
2. MEDIA TRACK DECLARATIONS
======================================================================
[AUDIO TRACK]
Source Classification: ${state.audioDeclaration.sourceType.toUpperCase()}
Track Title: ${state.audioDeclaration.name || (state.activeSafeMusic ? state.activeSafeMusic.title : 'Embedded Audio Track')}
Creator / Artist: ${state.audioDeclaration.creatorName || (state.activeSafeMusic ? state.activeSafeMusic.artist : 'Self / Unknown')}
Source URL: ${state.audioDeclaration.sourceUrl || 'N/A'}
License Proof / Certificate: ${state.audioDeclaration.licenseProof || 'None recorded'}
Commercial Use Permitted: ${state.audioDeclaration.commercialUsePermitted ? 'YES' : 'NO / UNVERIFIED'}
Attribution Required: ${state.audioDeclaration.attributionRequired ? 'YES' : 'NO'}
Attribution Text:
${state.audioDeclaration.attributionText ? `"${state.audioDeclaration.attributionText}"` : 'None required or not specified.'}

[VIDEO FOOTAGE TRACK]
Source Classification: ${state.videoDeclaration.sourceType.toUpperCase()}
Footage Name: ${metadata?.name || 'Video File'}
Recorded / Created By: ${state.videoDeclaration.creatorName || 'Self / Creator'}
Source URL: ${state.videoDeclaration.sourceUrl || 'Local File'}
License / Order ID: ${state.videoDeclaration.licenseProof || 'N/A'}
Commercial Use Permitted: ${state.videoDeclaration.commercialUsePermitted ? 'YES' : 'NO / UNVERIFIED'}

[FONTS & ASSETS]
Fonts Used: Google Fonts (Inter, Noto Nastaliq Urdu, Plus Jakarta Sans)
License: SIL Open Font License 1.1 (100% Free for commercial & personal use)

======================================================================
3. COPYRIGHT SAFETY CHECKLIST AUDIT
======================================================================
`;

  state.checklist.forEach((item, idx) => {
    const statusIcon = item.status === 'verified' ? '[PASS - VERIFIED]' : item.status === 'missing' ? '[FAIL - MISSING]' : item.status === 'pending' ? '[PENDING REVIEW]' : '[N/A]';
    text += `${idx + 1}. ${item.title}: ${statusIcon}\n`;
    text += `   Category: ${item.category} | Commercial Required: ${item.requiredForCommercial ? 'Yes' : 'No'}\n`;
    text += `   Guidance: ${item.description}\n`;
    if (item.notes) text += `   Notes: ${item.notes}\n`;
    text += `\n`;
  });

  text += `======================================================================
4. ATTRIBUTION TEMPLATE (COPY & PASTE INTO VIDEO DESCRIPTION)
======================================================================
${state.audioDeclaration.attributionText || 'No external attribution required based on current declarations.'}

======================================================================
END OF REPORT - CREATORCUT COPYRIGHT SAFETY CENTER
======================================================================
`;

  return text;
}

/**
 * Downloads the copyright checklist report as a clean UTF-8 text file
 */
export function downloadCopyrightReport(state: CopyrightSafetyState, metadata: VideoMetadata | null): void {
  const content = generateCopyrightReportText(state, metadata);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const baseName = metadata?.name ? metadata.name.replace(/\.[^/.]+$/, '') : 'creatorcut_project';
  a.download = `${baseName}_copyright_safety_report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
