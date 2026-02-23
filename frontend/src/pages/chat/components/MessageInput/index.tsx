import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo } from "react";
import * as S from "./styles";

type MessageInputProps = {
  layout?: "docked" | "centered";
  animateDocking?: boolean;
  introText?: string;
  prompt: string;
  pendingFiles: File[];
  sending: boolean;
  canSend: boolean;
  onPromptChange: (value: string) => void;
  onAddPendingFiles: (files: FileList | null) => void;
  onRemovePendingFile: (fileIndex: number) => void;
  onSend: () => Promise<boolean>;
  onCancel: () => void;
};

const IMAGE_TYPE_PREFIX = "image/";

type PendingFilePreview = {
  file: File;
  previewUrl: string | null;
};

export function MessageInput({
  layout = "docked",
  animateDocking = false,
  introText,
  prompt,
  pendingFiles,
  sending,
  canSend,
  onPromptChange,
  onAddPendingFiles,
  onRemovePendingFile,
  onSend,
  onCancel
}: MessageInputProps) {
  const pendingPreviews = useMemo<PendingFilePreview[]>(
    () =>
      pendingFiles.map((file) => ({
        file,
        previewUrl: file.type.startsWith(IMAGE_TYPE_PREFIX) ? URL.createObjectURL(file) : null
      })),
    [pendingFiles]
  );

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((preview) => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, [pendingPreviews]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    void onSend();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onAddPendingFiles(event.target.files);
    event.currentTarget.value = "";
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && canSend && !sending) {
      event.preventDefault();
      void onSend();
    }
  }

  return (
    <S.Composer onSubmit={handleSubmit} $layout={layout} $animateDocking={animateDocking}>
      {introText && <S.IntroText>{introText}</S.IntroText>}

      {pendingPreviews.length > 0 && (
        <S.PendingFiles>
          {pendingPreviews.map((preview, index) => (
            <S.PendingFile key={`${preview.file.name}_${index}`}>
              {preview.previewUrl ? (
                <S.PendingFilePreview
                  src={preview.previewUrl}
                  alt={`Preview de ${preview.file.name}`}
                />
              ) : (
                <S.PendingFileIcon aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H7.2C6.08 2 5.52 2 5.09 2.22C4.72 2.41 4.41 2.72 4.22 3.09C4 3.52 4 4.08 4 5.2V18.8C4 19.92 4 20.48 4.22 20.91C4.41 21.28 4.72 21.59 5.09 21.78C5.52 22 6.08 22 7.2 22H16.8C17.92 22 18.48 22 18.91 21.78C19.28 21.59 19.59 21.28 19.78 20.91C20 20.48 20 19.92 20 18.8V8L14 2Z" />
                    <path d="M14 2V8H20" />
                  </svg>
                </S.PendingFileIcon>
              )}

              <S.PendingFileInfo>
                <S.PendingFileName title={preview.file.name}>{preview.file.name}</S.PendingFileName>
                <S.PendingFileMeta>
                  {preview.previewUrl
                    ? "Imagem"
                    : (preview.file.name.split(".").pop() ?? "Arquivo").toUpperCase()}
                </S.PendingFileMeta>
              </S.PendingFileInfo>

              <S.RemovePendingFileButton
                type="button"
                onClick={() => onRemovePendingFile(index)}
                title={`Remover ${preview.file.name}`}
                aria-label={`Remover ${preview.file.name}`}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18" />
                  <path d="M6 6L18 18" />
                </svg>
              </S.RemovePendingFileButton>
            </S.PendingFile>
          ))}
        </S.PendingFiles>
      )}

      <S.InputRow>
        <S.AttachButton aria-label="Adicionar anexos">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5V19M5 12H19" />
          </svg>
          <S.AttachInput
            type="file"
            accept=".pdf,.txt,image/*"
            multiple
            onChange={handleFileChange}
          />
        </S.AttachButton>

        <S.PromptInput
          placeholder="Pergunte qualquer coisa..."
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={handlePromptKeyDown}
        />

        <S.SendButton
          type={sending ? "button" : "submit"}
          onClick={sending ? onCancel : undefined}
          disabled={sending ? false : !canSend}
          aria-label={sending ? "Cancelar resposta" : "Enviar mensagem"}
          title={sending ? "Cancelar resposta" : "Enviar mensagem"}
          $variant={sending ? "cancel" : "send"}
        >
          {sending ? (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="8" y="8" width="8" height="8" rx="1.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 17V7" />
              <path d="M8 11L12 7L16 11" />
            </svg>
          )}
        </S.SendButton>
      </S.InputRow>
    </S.Composer>
  );
}
