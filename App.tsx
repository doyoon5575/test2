
import React, { useState, useCallback, useEffect } from 'react';
import { RouteType, ParentFormData, OrgFormData, ReportState, IntegrationConfig } from './types';
import { Label, Input, Textarea, Chip } from './components/FormField';
import { generateEducationalSuggestion } from './services/geminiService';
import { Clipboard, FileText, Send, ArrowLeft, Building2, User, Sparkles, AlertCircle, CheckCircle2, Settings, X, Mail, Info, Users, RotateCcw, CopyCheck } from 'lucide-react';

const STORAGE_KEY = 'edu_sys_config_v4';

const App: React.FC = () => {
  const [route, setRoute] = useState<RouteType>('LANDING');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [report, setReport] = useState<ReportState>({
    markdown: '',
    type: 'LANDING',
    isGeneratingAI: false
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [config, setConfig] = useState<IntegrationConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      method: 'EMAIL',
      targetEmail: 'doyoon5575@gmail.com',
      formUrl: '',
      parentEntries: {},
      orgEntries: {}
    };
  });

  const [parentData, setParentData] = useState<ParentFormData>({
    childAge: '',
    childGender: '',
    isDisabled: '아니오',
    disabilityType: '',
    disabilityDegree: '',
    hasPreviousEducation: '',
    knowledgeLevel: '',
    guardianConcerns: '',
    cautionPoints: '',
    learnerInclination: '',
    prefersIndividualCounseling: '',
    smallGroupCount: '',
    preferredMode: '',
    preferredLocation: ''
  });

  const [orgData, setOrgData] = useState<OrgFormData>({
    orgName: '',
    contactNameTitle: '',
    contactPhoneEmail: '',
    venueAddress: '',
    audienceTypes: [],
    totalCount: '',
    mustIncludeTopics: '',
    preferredMode: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const resetToHome = () => {
    if (window.confirm("입력한 내용이 초기화되고 홈으로 이동합니다. 계속하시겠습니까?")) {
      setRoute('LANDING');
      setReport({ markdown: '', type: 'LANDING', isGeneratingAI: false });
      setParentData({
        childAge: '', childGender: '', isDisabled: '아니오', disabilityType: '', disabilityDegree: '',
        hasPreviousEducation: '', knowledgeLevel: '', guardianConcerns: '', cautionPoints: '',
        learnerInclination: '', prefersIndividualCounseling: '', smallGroupCount: '',
        preferredMode: '', preferredLocation: ''
      });
      setOrgData({
        orgName: '', contactNameTitle: '', contactPhoneEmail: '', venueAddress: '',
        audienceTypes: [], totalCount: '', mustIncludeTopics: '', preferredMode: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("리포트가 클립보드에 복사되었습니다.", "success");
      return true;
    } catch (err) {
      showToast("복사 실패. 수동으로 복사해주세요.", "error");
      return false;
    }
  };

  const handleCopyAction = async () => {
    const fullContent = `${report.markdown}\n\n[김도윤 박사 제언]\n${report.aiSuggestion || ''}`;
    await copyToClipboard(fullContent);
  };

  const generateReport = async (type: 'PARENT' | 'ORG') => {
    let md = '';
    if (type === 'PARENT') {
      md = `
성교육 대상자 사전 정보 리포트 (학부모용)

[1. 교육 대상자 기본 정보]
- 나이: ${parentData.childAge}
- 성별: ${parentData.childGender}
- 장애유무: ${parentData.isDisabled} ${parentData.isDisabled === '예' ? `(유형: ${parentData.disabilityType}, 정도: ${parentData.disabilityDegree})` : ''}
- 성향: ${parentData.learnerInclination}

[2. 교육 관련 정보]
- 기존 성교육 유무: ${parentData.hasPreviousEducation}
- 성교육 지식 정도: ${parentData.knowledgeLevel}

[3. 상세 요구사항 및 주의사항]
- 보호자 고민: ${parentData.guardianConcerns}
- 주의해야 할 점: ${parentData.cautionPoints}

[4. 상담 및 교육 방식 희망]
- 개인상담 희망: ${parentData.prefersIndividualCounseling}
- 소그룹상담 희망 인원: ${parentData.smallGroupCount || '해당 없음'}
- 희망 교육 방식: ${parentData.preferredMode} ${parentData.preferredLocation ? `(${parentData.preferredLocation})` : ''}
      `.trim();
    } else {
      md = `
성교육 기관 의뢰 리포트

[기관 정보]
- 기관명: ${orgData.orgName} / 담당자: ${orgData.contactNameTitle}
- 연락처: ${orgData.contactPhoneEmail}

[교육 설계]
- 대상: ${orgData.audienceTypes.join(', ')} / 총 ${orgData.totalCount}명
- 필수 포함 주제: ${orgData.mustIncludeTopics}
- 희망 방식: ${orgData.preferredMode} / 장소: ${orgData.venueAddress}
      `.trim();
    }

    setReport(prev => ({ ...prev, markdown: md, type, isGeneratingAI: true }));
    const aiResponse = await generateEducationalSuggestion(type === 'PARENT' ? parentData : orgData, type);
    setReport(prev => ({ ...prev, aiSuggestion: aiResponse, isGeneratingAI: false }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">성교육 사전 정보 수집 시스템</h1>
            <p className="text-sm text-slate-500">김도윤 박사와 함께하는 맞춤형 성교육 설계</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {route !== 'LANDING' && (
            <button onClick={resetToHome} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-red-400 hover:text-red-600 transition-all shadow-sm font-medium">
              <RotateCcw size={18} /> 처음으로
            </button>
          )}
          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm font-medium">
            <Settings size={18} /> 설정
          </button>
        </div>
      </header>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">설정</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label required>수신 이메일 주소</Label>
                <Input value={config.targetEmail} onChange={e => setConfig({...config, targetEmail: e.target.value})} />
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">저장 완료</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {route === 'LANDING' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center space-y-8 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">사용자 유형 선택</h2>
                <p className="text-slate-500">맞춤형 교육 설계를 위한 정보를 수집합니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setRoute('PARENT')} className="p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-400 hover:ring-4 hover:ring-blue-50 transition-all text-left space-y-4 group">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors"><User className="text-blue-600 group-hover:text-white" /></div>
                  <div><h3 className="font-bold text-lg text-slate-800">학부모/양육자</h3><p className="text-sm text-slate-500">자녀 특성 맞춤 교육 설계</p></div>
                </button>
                <button onClick={() => setRoute('ORG')} className="p-8 bg-white border border-slate-200 rounded-3xl hover:border-indigo-400 hover:ring-4 hover:ring-indigo-50 transition-all text-left space-y-4 group">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors"><Building2 className="text-indigo-600 group-hover:text-white" /></div>
                  <div><h3 className="font-bold text-lg text-slate-800">기관/학교</h3><p className="text-sm text-slate-500">단체 교육 의뢰서 작성</p></div>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button onClick={() => setRoute('LANDING')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={16} /> 홈으로</button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{route === 'PARENT' ? '학부모용' : '기관용'}</span>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); generateReport(route as 'PARENT' | 'ORG'); }} className="p-8 space-y-8">
                {route === 'PARENT' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label required>대상자 나이/학년</Label><Input placeholder="예: 11세 / 초등 4학년" value={parentData.childAge} onChange={e => setParentData({...parentData, childAge: e.target.value})} required /></div>
                      <div className="space-y-2"><Label required>대상자 성별</Label><div className="flex gap-2">{['남', '여', '기타'].map(opt => (<Chip key={opt} label={opt} type="radio" checked={parentData.childGender === opt} onChange={() => setParentData({...parentData, childGender: opt})} />))}</div></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div className="space-y-2"><Label required>장애 유무</Label><div className="flex gap-2">{['예', '아니오'].map(opt => (<Chip key={opt} label={opt} type="radio" checked={parentData.isDisabled === opt} onChange={() => setParentData({...parentData, isDisabled: opt})} />))}</div></div>
                      {parentData.isDisabled === '예' && (<div className="space-y-2"><Label required>유형 및 정도</Label><Input placeholder="예: 자폐 / 심함" value={parentData.disabilityType} onChange={e => setParentData({...parentData, disabilityType: e.target.value})} /></div>)}
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-100"><Label required>보호자 고민</Label><Textarea placeholder="교육이 필요한 주된 이유를 적어주세요." value={parentData.guardianConcerns} onChange={e => setParentData({...parentData, guardianConcerns: e.target.value})} required /></div>
                    <div className="space-y-2"><Label required>소그룹 인원 (본인 포함)</Label><Input type="number" placeholder="예: 1 (혼자일 경우 1)" value={parentData.smallGroupCount} onChange={e => setParentData({...parentData, smallGroupCount: e.target.value})} required /></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2"><Label required>기관명</Label><Input value={orgData.orgName} onChange={e => setOrgData({...orgData, orgName: e.target.value})} required /></div>
                    <div className="space-y-2"><Label required>교육 인원</Label><Input type="number" placeholder="총 인원수" value={orgData.totalCount} onChange={e => setOrgData({...orgData, totalCount: e.target.value})} required /></div>
                    <div className="space-y-2 pt-4 border-t border-slate-100"><Label required>요청 주제</Label><Textarea placeholder="필수 포함 주제 및 배경" value={orgData.mustIncludeTopics} onChange={e => setOrgData({...orgData, mustIncludeTopics: e.target.value})} required /></div>
                  </div>
                )}
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">분석 리포트 생성하기</button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 sticky top-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">결과 리포트 미리보기</h2>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {report.markdown ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-mono">{report.markdown}</pre>
                  </div>
                  {report.isGeneratingAI ? (
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <Sparkles className="text-blue-500 animate-pulse" size={20} />
                      <span className="text-blue-700 font-medium text-sm">분석 중</span>
                    </div>
                  ) : report.aiSuggestion && (
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm"><Sparkles size={16} /> 김도윤 박사 제언</div>
                      <div className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{report.aiSuggestion}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 py-20 opacity-60">
                  <FileText size={48} />
                  <p className="text-sm font-medium">설문 내용을 작성해주세요.</p>
                </div>
              )}
            </div>
            {report.markdown && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                <button onClick={handleCopyAction} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                  <CopyCheck size={18} /> 복사하기
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fix: Corrected ternary operator logic in toast className */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center gap-3 animate-fade-in ${
          toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
        } text-white`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;