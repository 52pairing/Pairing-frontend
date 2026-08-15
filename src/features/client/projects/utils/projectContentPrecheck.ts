import type {
  PrivacyCandidate,
  ProjectContentFinding,
  ProjectContentPrecheckResult,
  ProjectContentField,
} from "@/features/client/projects/types/contentPrecheck";
import { detectPrivacyCandidates } from "@/features/client/projects/utils/privacyDetection";
import { isLikelyRepeatedText } from "@/features/client/projects/utils/textSimilarity";

const MIN_RECOMMENDED_LENGTH = 20;
const FIELD_LABEL: Record<ProjectContentField, string> = {
  currentSituation: "현재 상황",
  mainTask: "주요 업무",
  detailScope: "상세 업무 범위",
  extraNote: "기타 전달사항",
};
const PRIVACY_LABEL: Record<PrivacyCandidate["type"], string> = {
  email: "이메일 주소",
  phone: "전화번호",
  account: "계좌번호로 보이는 숫자",
  rrn: "주민등록번호로 보이는 숫자",
};

const ELABORATION_PATTERNS = [
  /포함|제외|범위/,
  /산출물|결과물|납품/,
  /테스트|검증|품질 확인/,
  /배포|릴리스|운영 반영/,
  /담당|역할|내부 팀|협업|분담/,
  /(?:^|\n)\s*[-*•]|[·,][^·,]+[·,]/,
];

export function hasElaborationDetail(value: string) {
  return ELABORATION_PATTERNS.some((pattern) => pattern.test(value));
}

const privacyFinding = (
  candidate: PrivacyCandidate,
  index: number,
): ProjectContentFinding => ({
  id: `privacy-${candidate.field}-${candidate.type}-${index}`,
  kind: "privacy",
  field: candidate.field,
  title: `${FIELD_LABEL[candidate.field]}에서 ${PRIVACY_LABEL[candidate.type]}를 발견했습니다.`,
  description:
    "프로젝트 설명에 연락처나 정산 정보를 직접 작성하지 않았는지 확인해 주세요.",
  maskedValue: candidate.maskedValue,
  questions: ["업무 설명에 꼭 필요한 정보인지, 별도 안전한 경로로 전달할 수 있는지 확인해 주세요."],
});

export function runProjectContentPrecheck(input: {
  currentSituation?: string;
  mainTask?: string;
  detailScope?: string;
  extraNote?: string;
}): ProjectContentPrecheckResult {
  const currentSituation = input.currentSituation?.trim() ?? "";
  const mainTask = input.mainTask?.trim() ?? "";
  const detailScope = input.detailScope?.trim() ?? "";
  const extraNote = input.extraNote?.trim() ?? "";
  const findings: ProjectContentFinding[] = [];

  if (!mainTask) {
    findings.push({
      id: "missing-mainTask",
      kind: "missing",
      field: "mainTask",
      title: "주요 업무를 확인해 주세요.",
      description: "담당할 핵심 업무가 입력되어 있는지 확인해 주세요.",
      questions: ["프리랜서가 가장 먼저 수행해야 할 업무는 무엇인가요?"],
    });
  } else if (mainTask.length < MIN_RECOMMENDED_LENGTH) {
    findings.push({
      id: "short-mainTask",
      kind: "short",
      field: "mainTask",
      title: "주요 업무가 짧게 작성되어 있습니다.",
      description: "짧아도 구체적일 수 있으므로 수정 여부는 직접 판단해 주세요.",
      questions: ["업무 대상이나 완료해야 할 결과를 한 가지 더 적을 수 있나요?"],
    });
  }

  if (!detailScope) {
    findings.push({
      id: "missing-detailScope",
      kind: "missing",
      field: "detailScope",
      title: "상세 업무 범위가 비어 있습니다.",
      description: "선택 입력이므로 등록에는 영향이 없습니다.",
      questions: ["포함·제외 범위, 결과물 또는 역할 분담을 추가할 내용이 있나요?"],
    });
  } else {
    if (detailScope.length < MIN_RECOMMENDED_LENGTH) {
      findings.push({
        id: "short-detailScope",
        kind: "short",
        field: "detailScope",
        title: "상세 업무 범위가 짧게 작성되어 있습니다.",
        description: "짧아도 구체적일 수 있으므로 참고용으로만 안내합니다.",
        questions: ["담당 범위와 제외 범위 또는 완료 기준을 덧붙일 수 있나요?"],
      });
    } else if (!hasElaborationDetail(detailScope)) {
      // 이미 '짧음' 안내가 나갔다면 구체화 안내를 중복으로 표시하지 않는다.
      findings.push({
        id: "elaboration-detailScope",
        kind: "elaboration",
        field: "detailScope",
        title: "상세 범위에 구체화 정보를 추가했는지 확인해 주세요.",
        description:
          "규칙에 없는 표현도 충분히 구체적일 수 있어 부족하다고 단정하지 않습니다.",
        questions: ["포함·제외 항목, 결과물, 일정, 완료 기준 또는 역할 분담을 추가할 수 있나요?"],
      });
    }
  }

  if (mainTask && detailScope && isLikelyRepeatedText(mainTask, detailScope)) {
    findings.push({
      id: "repetition-both",
      kind: "repetition",
      field: "both",
      title: "두 항목에 반복되는 표현이 많습니다.",
      description:
        "의미 중복을 확정하지 않으며, 명백한 문자열 반복만 보수적으로 안내합니다.",
      questions: ["상세 범위에 포함·제외 항목, 결과물 또는 역할 분담이 추가되어 있나요?"],
    });
  }

  const privacyCandidates = (
    [
      ["currentSituation", currentSituation],
      ["mainTask", mainTask],
      ["detailScope", detailScope],
      ["extraNote", extraNote],
    ] as const
  ).flatMap(([field, value]) => detectPrivacyCandidates(field, value));
  findings.push(...privacyCandidates.map(privacyFinding));

  return { findings, checkedAt: Date.now() };
}
