"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import type { CurrentUserResponse } from "@/features/auth/types";
import { Header } from "@/features/common/components/header/Header";
import { ConfirmModal } from "@/features/common/components/Modal";
import { useToast } from "@/features/common/hooks/useToast";
import { ApiException } from "@/lib/api";

import {
  createInquiry,
  deleteInquiryFile,
  uploadInquiryFile,
} from "../services/support";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

function getSubmitErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) {
    return "문의를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.errorCode === "GLOBAL_008") {
    return "PDF, JPG, JPEG, PNG 파일만 첨부할 수 있습니다.";
  }

  if (error.errorCode === "FI_003" || error.status === 413) {
    return "첨부파일은 파일당 최대 10MB까지 업로드할 수 있습니다.";
  }

  if (error.errorCode === "GLOBAL_015") {
    return "첨부파일 전송 형식이 올바르지 않습니다.";
  }

  if (error.errorCode === "GLOBAL_007" || error.status >= 500) {
    return "서버에서 파일을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error.message || "문의를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

interface InquiryFormProps {
  // 서버에서 미리 조회한 로그인 사용자 (헤더 깜빡임 방지용)
  initialUser?: CurrentUserResponse | null;
}

export function InquiryForm({ initialUser = null }: InquiryFormProps) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const addFiles = (selectedFiles: File[]) => {
    const invalidFile = selectedFiles.find(
      (file) => {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        return (
          !ACCEPTED_FILE_EXTENSIONS.includes(extension) ||
          file.size > MAX_FILE_SIZE
        );
      },
    );

    if (invalidFile) {
      setFileError("PDF, JPG, JPEG, PNG 파일만 파일당 10MB까지 첨부할 수 있습니다.");
      return;
    }

    setFileError("");
    setFiles((current) => {
      const fileKeys = new Set(current.map((file) => `${file.name}-${file.size}`));
      return [
        ...current,
        ...selectedFiles.filter((file) => !fileKeys.has(`${file.name}-${file.size}`)),
      ];
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isValid && !isSubmitting) setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const uploadedFileIds: number[] = [];

    try {
      // 첨부파일을 병렬 업로드한다. 일부만 성공한 경우에도 성공분 id를 모아
      // catch에서 롤백할 수 있게 하고, 첫 실패 원인을 그대로 전파해 에러 메시지 분기를 유지한다.
      const uploadResults = await Promise.allSettled(
        files.map((file) => uploadInquiryFile(file)),
      );
      for (const result of uploadResults) {
        if (result.status === "fulfilled") uploadedFileIds.push(result.value.fileId);
      }
      const firstRejection = uploadResults.find(
        (result) => result.status === "rejected",
      );
      if (firstRejection) throw firstRejection.reason;

      const createdInquiry = await createInquiry({
        title: title.trim(),
        content: content.trim(),
        fileIds: uploadedFileIds,
      });

      setIsConfirmOpen(false);
      router.replace(
        `/support/inquiries/complete?inquiryId=${createdInquiry.inquiryId}`,
      );
    } catch (error) {
      await Promise.allSettled(uploadedFileIds.map(deleteInquiryFile));
      setIsConfirmOpen(false);
      toast.error(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header role="guest" initialUser={initialUser} />
      <main className="flex-1 bg-background px-5 pb-20 pt-8 text-theme-primary sm:px-8 sm:pt-10">
        <div className="mx-auto w-full max-w-[810px]">
          <Link
            href="/support/inquiries"
            className="inline-flex items-center gap-1 text-sm font-semibold text-theme-secondary hover:text-theme-primary"
          >
            <span aria-hidden="true">←</span>
            1대1 문의로 돌아가기
          </Link>

          <h1 className="mt-3 text-[28px] font-extrabold tracking-[-0.04em] sm:text-[31px]">
            1:1 문의 작성
          </h1>
          <p className="mt-2 break-keep text-sm font-medium text-theme-muted">
            문의 내용을 구체적으로 작성하면 더 정확한 답변을 받을 수 있습니다.
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <section className="rounded-[14px] border border-theme bg-surface px-6 py-7 sm:px-9 sm:py-8">
              <FormField inputId="inquiry-title" label="문의 제목" required>
                <input
                  id="inquiry-title"
                  type="text"
                  value={title}
                  maxLength={MAX_TITLE_LENGTH}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="문의 제목을 입력해 주세요."
                  className="mt-2 h-14 w-full rounded-[10px] border border-theme bg-surface px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
                />
              </FormField>

              <FormField inputId="inquiry-content" label="문의 내용" required className="mt-7">
                <textarea
                  id="inquiry-content"
                  value={content}
                  maxLength={MAX_CONTENT_LENGTH}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="문의 내용을 자세히 입력해 주세요."
                  className="mt-2 min-h-[250px] w-full resize-y rounded-[10px] border border-theme bg-surface px-4 py-4 text-sm leading-6 text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
                />
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-theme-muted">
                  <p className="break-keep">
                    오류가 발생한 경우 이용한 페이지, 발생 시점과 화면에 표시된 내용을 함께 작성해 주세요.
                  </p>
                  <span className="ml-auto shrink-0">
                    {content.length}/{MAX_CONTENT_LENGTH}
                  </span>
                </div>
              </FormField>

              <FormField inputId="inquiry-files" label="첨부파일" optional className="mt-7">
                <input
                  id="inquiry-files"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className="mt-2 flex min-h-[150px] w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-theme-strong bg-surface-subtle px-5 text-center hover:border-brand"
                >
                  <UploadIcon />
                  <span className="mt-3 text-sm font-semibold text-theme-secondary">
                    파일을 끌어놓거나 클릭해 첨부해 주세요.
                  </span>
                  <span className="mt-1 text-xs text-theme-muted">
                    PDF, JPG, JPEG, PNG · 파일당 최대 10MB
                  </span>
                </button>

                {fileError ? (
                  <p role="alert" className="mt-2 text-xs font-medium text-theme-danger">
                    {fileError}
                  </p>
                ) : null}

                {files.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {files.map((file) => (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle px-4 py-3 text-xs"
                      >
                        <span className="min-w-0 truncate font-semibold text-theme-secondary">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((current) => current.filter((item) => item !== file))
                          }
                          className="shrink-0 font-bold text-theme-danger"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </FormField>
            </section>

            <div className="mt-6 flex justify-end gap-3">
              <Link
                href="/support/inquiries"
                className="flex h-12 items-center justify-center rounded-[10px] border-2 border-brand bg-surface px-7 text-sm font-bold text-brand hover:bg-surface-subtle"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={!isValid}
                aria-busy={isSubmitting}
                className="h-12 rounded-[10px] bg-brand px-7 text-sm font-bold text-brand-contrast hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted"
              >
                {isSubmitting ? "접수 중..." : "문의 접수"}
              </button>
            </div>
          </form>

          <ConfirmModal
            open={isConfirmOpen}
            title="문의를 접수하시겠어요?"
            description="접수한 문의는 문의 목록에서 확인할 수 있습니다."
            confirmText={isSubmitting ? "접수 중..." : "접수 하기"}
            cancelText="취소"
            onClose={() => {
              if (!isSubmitting) setIsConfirmOpen(false);
            }}
            onConfirm={() => void handleConfirmSubmit()}
            closeOnOverlayClick={!isSubmitting}
          />
        </div>
      </main>
    </>
  );
}

function FormField({
  inputId,
  label,
  required = false,
  optional = false,
  className = "",
  children,
}: {
  inputId: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-[13px] font-bold text-theme-secondary">
        {label}
        {required ? <span className="ml-1 text-theme-danger">*</span> : null}
        {optional ? <span className="ml-1 font-medium text-theme-muted">(선택)</span> : null}
      </label>
      {children}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="text-theme-muted">
      <path d="M14 18V4M14 4 9 9M14 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 17v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
