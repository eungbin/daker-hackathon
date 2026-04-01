import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HackathonDetail } from '../../../types';
import { useStoreContext } from '../../../store/StoreContext';
import { useAuth } from '../../../store/AuthContext';

interface Props {
  detail: HackathonDetail;
  onSubmitDone?: () => void;
}

export default function SubmitTab({ detail, onSubmitDone }: Props) {
  const { submit } = detail.sections;
  const { addSubmission, teams } = useStoreContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMultiStep = !!(submit.submissionItems && submit.submissionItems.length > 0);
  const steps = submit.submissionItems ?? [];

  const userTeam = currentUser
    ? teams.find(t => t.hackathonSlugs?.includes(detail.slug) && t.createdBy === currentUser.id)
    : undefined;

  const [notes, setNotes] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});       // url, text_or_url, text
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});  // pdf_url의 URL 파트
  const [pdfFiles, setPdfFiles] = useState<Record<string, File | null>>({}); // pdf, pdf_url의 파일 파트
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const isStepDone = (key: string, format: string) => {
    if (format === 'pdf') return !!pdfFiles[key];
    if (format === 'pdf_url') return !!(urlInputs[key]?.trim() || pdfFiles[key]);
    return !!values[key]?.trim();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (isMultiStep) {
      steps.forEach(item => {
        if (item.format === 'pdf') {
          if (!pdfFiles[item.key]) newErrors[item.key] = 'PDF 파일을 업로드해주세요.';
        } else if (item.format === 'pdf_url') {
          const hasUrl = urlInputs[item.key]?.trim();
          const hasPdf = pdfFiles[item.key];
          if (!hasUrl && !hasPdf) {
            newErrors[item.key] = 'URL 또는 PDF 파일 중 하나를 입력해주세요.';
          } else if (hasUrl) {
            try { new URL(urlInputs[item.key]); } catch { newErrors[item.key] = '유효한 URL을 입력해주세요. (https://...)'; }
          }
        } else if (item.format === 'url') {
          if (!values[item.key]?.trim()) {
            newErrors[item.key] = '필수 항목을 입력해주세요.';
          } else {
            try { new URL(values[item.key]); } catch { newErrors[item.key] = '유효한 URL을 입력해주세요. (https://...)'; }
          }
        } else {
          if (!values[item.key]?.trim()) newErrors[item.key] = '필수 항목을 입력해주세요.';
        }
      });
    } else {
      if (!file) newErrors.file = 'ZIP 파일을 선택해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const finalValues: Record<string, string> = {};
    if (isMultiStep) {
      steps.forEach(item => {
        if (item.format === 'pdf') {
          finalValues[item.key] = pdfFiles[item.key]?.name || '';
        } else if (item.format === 'pdf_url') {
          finalValues[item.key] = JSON.stringify({
            url: urlInputs[item.key] || '',
            pdfFile: pdfFiles[item.key]?.name || '',
          });
        } else {
          finalValues[item.key] = values[item.key] || '';
        }
      });
    }
    const submission = {
      id: `sub-${Date.now()}`,
      hackathonSlug: detail.slug,
      teamName: userTeam?.name ?? '',
      submittedAt: new Date().toISOString(),
      type: isMultiStep ? 'multi' : 'zip',
      content: JSON.stringify(isMultiStep ? finalValues : { file: file?.name }),
      notes: notes.trim() || undefined,
      submittedBy: currentUser?.id,
    };
    addSubmission(submission);
    setSubmitted(true);
    setTimeout(() => { onSubmitDone?.(); }, 1500);
  };

  if (!currentUser) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-10 text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h3 className="text-white font-semibold mb-2">로그인이 필요합니다</h3>
        <p className="text-gray-400 text-sm mb-4">제출하려면 먼저 로그인해주세요.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-primary text-white text-sm px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  if (!userTeam) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-10 text-center">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-white font-semibold mb-2">팀장만 제출할 수 있습니다</h3>
        <p className="text-gray-400 text-sm mb-4">
          이 해커톤에 등록된 팀의 팀장이어야 제출이 가능합니다.
        </p>
        <button
          onClick={() => navigate('/camp')}
          className="bg-primary text-white text-sm px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          팀 만들러 가기
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-white font-semibold text-lg mb-2">제출 완료!</h3>
        <p className="text-gray-400 text-sm">리더보드로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guide */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">제출 가이드</h3>
        <ul className="space-y-2">
          {submit.guide.map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-primary mt-0.5">•</span>{g}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {submit.allowedArtifactTypes.map(t => (
            <span key={t} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
              {t.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Step progress indicator */}
      {isMultiStep && steps.length > 1 && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-white">제출 단계</h4>
            <span className="text-xs text-gray-500">{currentStep + 1} / {steps.length}</span>
          </div>
          <div className="flex gap-2">
            {steps.map((step, i) => {
              const isDone = isStepDone(step.key, step.format);
              return (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(i)}
                  className={`flex-1 py-2 px-2 rounded-lg border text-left transition-all ${
                    i === currentStep
                      ? 'bg-primary/20 border-primary/40 text-white font-medium'
                      : isDone
                      ? 'bg-green-900/20 border-green-700/40 text-green-400'
                      : 'bg-white/3 border-card-border text-gray-500'
                  }`}
                >
                  <div className="text-xs mb-0.5">{isDone ? '✓' : `${i + 1}`}</div>
                  <div className="truncate text-xs">{step.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
        <h3 className="text-white font-semibold">제출하기</h3>

        {/* Team Name (read-only) */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5 font-medium">팀 이름</label>
          <div className="w-full bg-neutral border border-card-border rounded-lg py-2 px-3 text-sm text-gray-400">
            {userTeam.name}
          </div>
        </div>

        {/* Multi-step: show one step at a time */}
        {isMultiStep ? (
          <div className="space-y-4">
            {steps.map((item, i) => (
              <div
                key={item.key}
                className={`border rounded-xl p-4 transition-all ${
                  steps.length > 1 && i !== currentStep ? 'hidden' : ''
                } ${errors[item.key] ? 'border-red-500/50' : 'border-card-border'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 bg-primary/20 text-primary text-xs rounded-full flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{item.format}</span>
                  <span className="text-red-400 text-xs">*</span>
                </div>

                {item.format === 'url' && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={values[item.key] || ''}
                    onChange={e => { setValues(v => ({ ...v, [item.key]: e.target.value })); setErrors(p => ({ ...p, [item.key]: '' })); }}
                    className={`w-full bg-neutral border rounded-lg py-2 px-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                      errors[item.key] ? 'border-red-500' : 'border-card-border focus:border-primary/50'
                    }`}
                  />
                )}

                {item.format === 'pdf' && (
                  <PdfUpload
                    file={pdfFiles[item.key] ?? null}
                    error={errors[item.key]}
                    onChange={f => { setPdfFiles(p => ({ ...p, [item.key]: f })); setErrors(p => ({ ...p, [item.key]: '' })); }}
                  />
                )}

                {item.format === 'pdf_url' && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">URL 입력 (선택)</p>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={urlInputs[item.key] || ''}
                        onChange={e => { setUrlInputs(v => ({ ...v, [item.key]: e.target.value })); setErrors(p => ({ ...p, [item.key]: '' })); }}
                        className="w-full bg-neutral border border-card-border rounded-lg py-2 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="flex-1 h-px bg-card-border" />
                      <span>또는</span>
                      <div className="flex-1 h-px bg-card-border" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">PDF 파일 업로드 (선택)</p>
                      <PdfUpload
                        file={pdfFiles[item.key] ?? null}
                        error={undefined}
                        onChange={f => { setPdfFiles(p => ({ ...p, [item.key]: f })); setErrors(p => ({ ...p, [item.key]: '' })); }}
                      />
                    </div>
                  </div>
                )}

                {item.format !== 'url' && item.format !== 'pdf' && item.format !== 'pdf_url' && (
                  <textarea
                    placeholder="내용을 입력하거나 URL을 붙여넣으세요..."
                    value={values[item.key] || ''}
                    onChange={e => { setValues(v => ({ ...v, [item.key]: e.target.value })); setErrors(p => ({ ...p, [item.key]: '' })); }}
                    rows={3}
                    className={`w-full bg-neutral border rounded-lg py-2 px-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors resize-none ${
                      errors[item.key] ? 'border-red-500' : 'border-card-border focus:border-primary/50'
                    }`}
                  />
                )}

                {errors[item.key] && <p className="mt-1 text-xs text-red-400">{errors[item.key]}</p>}
              </div>
            ))}

            {steps.length > 1 && (
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(s => s - 1)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-xl text-sm transition-colors"
                  >
                    ← 이전
                  </button>
                )}
                {currentStep < steps.length - 1 && (
                  <button
                    onClick={() => setCurrentStep(s => s + 1)}
                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-2 rounded-xl text-sm transition-colors"
                  >
                    다음 →
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              ZIP 파일 <span className="text-red-400">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              errors.file ? 'border-red-500/50' : 'border-card-border hover:border-primary/40'
            }`}>
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm text-gray-400 mb-3">ZIP 파일을 드래그하거나 클릭하여 업로드</p>
              <input
                type="file"
                accept=".zip"
                onChange={e => { setFile(e.target.files?.[0] || null); setErrors(p => ({ ...p, file: '' })); }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm hover:bg-primary/20 transition-colors">
                파일 선택
              </label>
              {file && <p className="mt-2 text-xs text-green-400">✓ {file.name}</p>}
            </div>
            {errors.file && <p className="mt-1 text-xs text-red-400">{errors.file}</p>}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5 font-medium">메모 (선택)</label>
          <textarea
            placeholder="제출물에 대한 메모나 참고 사항을 입력하세요..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-neutral border border-card-border rounded-lg py-2 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30"
        >
          제출하기
        </button>
      </div>
    </div>
  );
}

interface PdfUploadProps {
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

function PdfUpload({ file, error, onChange }: PdfUploadProps) {
  // eslint-disable-next-line react-hooks/purity
  const id = `pdf-upload-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
      error ? 'border-red-500/50' : 'border-card-border hover:border-primary/40'
    }`}>
      <div className="text-3xl mb-1">📄</div>
      <p className="text-xs text-gray-400 mb-2">PDF 파일을 선택하세요</p>
      <input
        type="file"
        accept=".pdf"
        onChange={e => onChange(e.target.files?.[0] || null)}
        className="hidden"
        id={id}
      />
      <label htmlFor={id} className="cursor-pointer bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs hover:bg-primary/20 transition-colors">
        파일 선택
      </label>
      {file && <p className="mt-2 text-xs text-green-400">✓ {file.name}</p>}
    </div>
  );
}
