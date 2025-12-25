
import { GoogleGenAI } from "@google/genai";
import { ParentFormData, OrgFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEducationalSuggestion = async (data: ParentFormData | OrgFormData, type: 'PARENT' | 'ORG') => {
  const model = 'gemini-3-flash-preview';
  
  let isGroupOfFourOrMore = false;
  let count = 0;
  if (type === 'PARENT') {
    count = parseInt((data as ParentFormData).smallGroupCount) || 0;
    isGroupOfFourOrMore = count >= 4;
  } else {
    count = parseInt((data as OrgFormData).totalCount) || 0;
    isGroupOfFourOrMore = count >= 4;
  }

  let prompt = '';
  const commonRules = `
    **출력 규칙 (엄격 준수)**:
    1. 시작 멘트는 반드시 "안녕하세요. 김도윤 박사 입니다." 단 한 줄로 시작하세요.
    2. 제언 내용은 딱 3가지만 숫자로 번호를 매겨서 작성하세요.
    3. 기호, 부호, 별표(*), 점(.), 대시(-), 불렛 포인트, 마크다운 특수문자(#, **)를 절대로 사용하지 마세요.
    4. 오직 "1. 내용 2. 내용 3. 내용" 형식의 숫자와 줄바꿈만 사용하세요.
    5. 마지막에 제시할 솔루션 2가지는 아래의 조건에 맞춰 심플하게 제안하세요.
       - 기본 원칙: 비대면 프로그램을 우선적으로 제안합니다.
       - 인원 조건: 현재 인원이 ${count}명이므로 ${isGroupOfFourOrMore ? '대면/비대면 선택 가능 옵션을 포함하세요' : '비대면 옵션만 제시하세요'}.
       - 프로그램 옵션 예시: [비대면] 90분 1회기 교육 프로그램, [대면/비대면 선택] 90분 1회기 교육 프로그램, [비대면] 60분 3회기 교육 프로그램 등
       - 형식: 솔루션1. [프로그램명] (비용협의)
       - 형식: 솔루션2. [프로그램명] (비용협의)
  `;

  if (type === 'PARENT') {
    const pData = data as ParentFormData;
    prompt = `
      성교육 전문가 김도윤 박사로서 학부모 정보를 분석하고 전문적인 제언을 해주세요.
      나이: ${pData.childAge}, 성별: ${pData.childGender}, 장애: ${pData.isDisabled}, 고민: ${pData.guardianConcerns}, 주의사항: ${pData.cautionPoints}
      ${commonRules}
    `;
  } else {
    const oData = data as OrgFormData;
    prompt = `
      성교육 전문가 김도윤 박사로서 기관 의뢰를 분석해주세요.
      기관명: ${oData.orgName}, 대상: ${oData.audienceTypes.join(', ')}, 인원: ${oData.totalCount}, 주제: ${oData.mustIncludeTopics}
      ${commonRules}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "당신은 성교육 전문가 김도윤 박사입니다. 기호 없이 오직 숫자 번호와 텍스트로만 3가지 제언과 2가지 솔루션(비대면 위주)을 전달합니다.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "안녕하세요. 김도윤 박사 입니다. 현재 분석이 어렵습니다. 다시 시도해 주세요.";
  }
};
