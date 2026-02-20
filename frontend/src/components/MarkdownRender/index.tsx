import { useMemo } from "react";
import { marked, type Tokens } from "marked";
import * as S from "./styles";

type MarkdownRenderProps = {
  content: string;
  className?: string;
};

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "m4v", "mkv"]);
const DOCUMENT_EXTENSIONS = new Set([
  "pdf",
  "txt",
  "md",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "rtf",
  "odt",
  "ods",
  "odp"
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeLinkHref(value?: string | null): string | null {
  const rawValue = value?.trim();
  if (!rawValue) return null;

  if (
    rawValue.startsWith("#") ||
    rawValue.startsWith("/") ||
    rawValue.startsWith("./") ||
    rawValue.startsWith("../")
  ) {
    return rawValue;
  }

  const protocolMatch = rawValue.match(/^([a-z][a-z\d+\-.]*):/i);
  if (!protocolMatch) {
    return rawValue;
  }

  const protocol = protocolMatch[1].toLowerCase();
  if (protocol === "http" || protocol === "https" || protocol === "mailto" || protocol === "tel") {
    return rawValue;
  }

  return null;
}

function sanitizeMediaSrc(value?: string | null): string | null {
  const rawValue = value?.trim();
  if (!rawValue) return null;

  if (
    rawValue.startsWith("/") ||
    rawValue.startsWith("./") ||
    rawValue.startsWith("../") ||
    rawValue.startsWith("blob:")
  ) {
    return rawValue;
  }

  if (rawValue.startsWith("data:image/") || rawValue.startsWith("data:video/")) {
    return rawValue;
  }

  const protocolMatch = rawValue.match(/^([a-z][a-z\d+\-.]*):/i);
  if (!protocolMatch) {
    return rawValue;
  }

  const protocol = protocolMatch[1].toLowerCase();
  if (protocol === "http" || protocol === "https") {
    return rawValue;
  }

  return null;
}

function getFileExtension(value: string): string {
  const noHash = value.split("#")[0] ?? "";
  const noQuery = noHash.split("?")[0] ?? "";
  const fileName = noQuery.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex < 0) return "";
  return fileName.slice(dotIndex + 1).toLowerCase();
}

function getLabel(token: Tokens.Link | Tokens.Image): string {
  const normalizedText = token.text?.trim();
  if (normalizedText) return normalizedText;

  const normalizedHref = token.href?.trim();
  if (normalizedHref) return normalizedHref;

  return "Abrir arquivo";
}

function getYouTubeEmbedUrl(href: string): string | null {
  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    return null;
  }

  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();
    let videoId = "";

    if (host === "youtu.be") {
      videoId = url.pathname.replace("/", "");
    } else if (host.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? "";
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] ?? "";
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2] ?? "";
      }
    }

    if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  } catch {
    return null;
  }
}

function buildDocumentBlock(href: string, label: string, title?: string | null): string {
  const extension = getFileExtension(href);
  const badge = extension ? extension.toUpperCase() : "DOC";
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  const titleAttribute = title?.trim() ? ` title="${escapeHtml(title)}"` : "";

  return `<div class="md-media md-media-document">
    <a class="md-document-link" href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow"${titleAttribute}>
      <span class="md-document-badge">${badge}</span>
      <span class="md-document-text">${safeLabel}</span>
    </a>
  </div>`;
}

function buildVideoBlock(
  src: string,
  label: string,
  title?: string | null,
  youtubeEmbedUrl?: string | null
): string {
  const safeSrc = escapeHtml(src);
  const safeLabel = escapeHtml(label);
  const titleAttribute = title?.trim() ? ` title="${escapeHtml(title)}"` : "";

  if (youtubeEmbedUrl) {
    const safeEmbedUrl = escapeHtml(youtubeEmbedUrl);
    return `<figure class="md-media md-media-video">
      <div class="md-video-embed">
        <iframe
          src="${safeEmbedUrl}"
          title="${safeLabel}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      <figcaption>
        <a href="${safeSrc}" target="_blank" rel="noopener noreferrer nofollow"${titleAttribute}>${safeLabel}</a>
      </figcaption>
    </figure>`;
  }

  return `<figure class="md-media md-media-video">
    <video class="md-video" controls preload="metadata" src="${safeSrc}"></video>
    <figcaption>
      <a href="${safeSrc}" target="_blank" rel="noopener noreferrer nofollow"${titleAttribute}>${safeLabel}</a>
    </figcaption>
  </figure>`;
}

function renderLink(token: Tokens.Link): string {
  const href = sanitizeLinkHref(token.href);
  const label = getLabel(token);
  const safeLabel = escapeHtml(label);
  if (!href) return safeLabel;

  const extension = getFileExtension(href);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(href);
  const titleAttribute = token.title?.trim() ? ` title="${escapeHtml(token.title)}"` : "";

  if (youtubeEmbedUrl || VIDEO_EXTENSIONS.has(extension)) {
    return buildVideoBlock(href, label, token.title, youtubeEmbedUrl);
  }

  if (DOCUMENT_EXTENSIONS.has(extension)) {
    return buildDocumentBlock(href, label, token.title);
  }

  const safeHref = escapeHtml(href);
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow"${titleAttribute}>${safeLabel}</a>`;
}

function renderImage(token: Tokens.Image): string {
  const src = sanitizeMediaSrc(token.href);
  if (!src) return "";

  const alt = token.text?.trim() || "Imagem";
  const extension = getFileExtension(src);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);

  if (youtubeEmbedUrl || VIDEO_EXTENSIONS.has(extension)) {
    return buildVideoBlock(src, alt, token.title, youtubeEmbedUrl);
  }

  if (DOCUMENT_EXTENSIONS.has(extension)) {
    return buildDocumentBlock(src, alt, token.title);
  }

  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  const safeTitle = token.title?.trim() ? escapeHtml(token.title) : "";
  const titleAttribute = safeTitle ? ` title="${safeTitle}"` : "";
  const caption = safeTitle ? `<figcaption>${safeTitle}</figcaption>` : "";

  return `<figure class="md-media md-media-image">
    <img src="${safeSrc}" alt="${safeAlt}" loading="lazy" decoding="async"${titleAttribute} />
    ${caption}
  </figure>`;
}

const MARKDOWN_RENDERER = new marked.Renderer();
MARKDOWN_RENDERER.link = (token) => renderLink(token);
MARKDOWN_RENDERER.image = (token) => renderImage(token);
MARKDOWN_RENDERER.html = (token) => escapeHtml(token.text);

const MARKDOWN_OPTIONS = {
  async: false as const,
  breaks: true,
  gfm: true,
  pedantic: false,
  renderer: MARKDOWN_RENDERER
};

function parseMarkdown(content: string): string {
  const normalized = content.trim();
  if (!normalized) return "";

  try {
    return marked.parse(content, MARKDOWN_OPTIONS);
  } catch {
    return `<p>${escapeHtml(content)}</p>`;
  }
}

export function MarkdownRender({ content, className }: MarkdownRenderProps) {
  const html = useMemo(() => parseMarkdown(content), [content]);
  if (!html) return null;

  return <S.MarkdownRoot className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
