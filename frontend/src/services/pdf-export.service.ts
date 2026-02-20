import { jsPDF } from "jspdf";
import { Conversation, Message } from "../types/chat.types";

type ExportConversationPdfParams = {
  chatName: string;
  conversation: Conversation;
  messages: Message[];
};

type PdfLineStyle = "content" | "section" | "link";

type PdfLine = {
  text: string;
  style: PdfLineStyle;
  beforeGap: number;
  url?: string;
};

type PageFrameData = {
  chatName: string;
  conversationName: string;
  createdAtLabel: string;
};

const PAGE_MARGIN_X = 40;
const PAGE_MARGIN_BOTTOM = 34;
const HEADER_HEIGHT = 68;
const CONTENT_START_Y = HEADER_HEIGHT + 18;
const MESSAGE_GAP = 14;
const ROLE_LINE_HEIGHT = 10;
const ROLE_TO_BUBBLE_GAP = 5;
const BUBBLE_PADDING_TOP = 12;
const BUBBLE_PADDING_BOTTOM = 10;
const BUBBLE_PADDING_X = 12;
const BUBBLE_META_GAP = 8;
const BUBBLE_META_HEIGHT = 9;
const MAX_BUBBLE_RATIO = 0.72;
const MIN_BUBBLE_INNER_WIDTH = 140;
const CONTENT_FONT_SIZE = 10.8;
const SECTION_FONT_SIZE = 9.3;
const LINK_FONT_SIZE = 9.4;
const META_FONT_SIZE = 8.2;
const CONTENT_LINE_HEIGHT = 14;
const SECTION_LINE_HEIGHT = 12;
const LINK_LINE_HEIGHT = 12.6;

export function exportConversationPdf({
  chatName,
  conversation,
  messages
}: ExportConversationPdfParams): void {
  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxBubbleInnerWidth = pageWidth * MAX_BUBBLE_RATIO - BUBBLE_PADDING_X * 2;
  const conversationName = conversation.name || "Nova conversa";
  const createdAtLabel = formatDateTime(conversation.createdAt);
  const printableMessages = messages.filter((message) => !message.del);

  doc.setProperties({
    title: `Conversa - ${conversationName}`,
    subject: "Exportacao de conversa",
    author: chatName || "Chat",
    creator: chatName || "Chat"
  });

  drawPageFrame(doc, {
    chatName,
    conversationName,
    createdAtLabel
  });

  let cursorY = CONTENT_START_Y;

  if (!printableMessages.length) {
    drawEmptyConversationState(doc, pageWidth);
  } else {
    for (const message of printableMessages) {
      const messageLines = buildMessageLines(doc, message, maxBubbleInnerWidth);
      const bubbleInnerWidth = resolveBubbleInnerWidth(doc, messageLines, maxBubbleInnerWidth);
      const bubbleWidth = bubbleInnerWidth + BUBBLE_PADDING_X * 2;
      const userMessage = message.role !== "assistant";
      const bubbleX = userMessage
        ? pageWidth - PAGE_MARGIN_X - bubbleWidth
        : PAGE_MARGIN_X;
      const timestamp = formatDateTime(message.date || message.createdAt || message.updatedAt);

      let lineIndex = 0;
      let firstChunk = true;

      while (lineIndex < messageLines.length) {
        const maxY = pageHeight - PAGE_MARGIN_BOTTOM;
        const chunkOverhead =
          ROLE_LINE_HEIGHT +
          ROLE_TO_BUBBLE_GAP +
          BUBBLE_PADDING_TOP +
          BUBBLE_META_GAP +
          BUBBLE_META_HEIGHT +
          BUBBLE_PADDING_BOTTOM;
        let availableLineHeight = maxY - cursorY - chunkOverhead;

        if (availableLineHeight < CONTENT_LINE_HEIGHT) {
          doc.addPage();
          drawPageFrame(doc, {
            chatName,
            conversationName,
            createdAtLabel
          });
          cursorY = CONTENT_START_Y;
          availableLineHeight = maxY - cursorY - chunkOverhead;
        }

        const chunkStartIndex = lineIndex;
        let usedLineHeight = 0;

        while (lineIndex < messageLines.length) {
          const line = messageLines[lineIndex];
          const nextLineHeight = line.beforeGap + getLineHeight(line.style);

          if (usedLineHeight + nextLineHeight > availableLineHeight) {
            if (lineIndex === chunkStartIndex) {
              usedLineHeight += nextLineHeight;
              lineIndex += 1;
            }
            break;
          }

          usedLineHeight += nextLineHeight;
          lineIndex += 1;
        }

        const chunkLines = messageLines.slice(chunkStartIndex, lineIndex);
        const bubbleHeight =
          BUBBLE_PADDING_TOP +
          usedLineHeight +
          BUBBLE_META_GAP +
          BUBBLE_META_HEIGHT +
          BUBBLE_PADDING_BOTTOM;
        const blockHeight = ROLE_LINE_HEIGHT + ROLE_TO_BUBBLE_GAP + bubbleHeight;

        if (cursorY + blockHeight > maxY) {
          doc.addPage();
          drawPageFrame(doc, {
            chatName,
            conversationName,
            createdAtLabel
          });
          cursorY = CONTENT_START_Y;
        }

        renderMessageChunk(doc, {
          message,
          chunkLines,
          bubbleX,
          bubbleWidth,
          bubbleHeight,
          cursorY,
          userMessage,
          timestamp,
          firstChunk,
          hasMoreChunks: lineIndex < messageLines.length
        });

        cursorY += blockHeight + MESSAGE_GAP;
        firstChunk = false;
      }
    }
  }

  stampPageNumbers(doc, pageWidth, pageHeight);

  const fileName = `${slugify(conversationName)}-${buildTimestampToken()}.pdf`;
  doc.save(fileName);
}

function drawPageFrame(doc: jsPDF, frame: PageFrameData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const createdLabel = `Criada em: ${frame.createdAtLabel}`;

  doc.setFillColor(244, 248, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(11, 19, 32);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(219, 232, 255);
  doc.text(frame.chatName || "Chat", PAGE_MARGIN_X, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  doc.setTextColor(158, 188, 235);
  doc.text("Exportacao de conversa", PAGE_MARGIN_X, 40);

  doc.setFontSize(9.5);
  doc.setTextColor(208, 223, 246);
  const createdLabelWidth = doc.getTextWidth(createdLabel);
  const conversationMaxWidth = pageWidth - PAGE_MARGIN_X * 2 - createdLabelWidth - 16;
  const conversationLabel = truncateText(
    doc,
    `Conversa: ${frame.conversationName || "Nova conversa"}`,
    conversationMaxWidth
  );
  doc.text(conversationLabel, PAGE_MARGIN_X, 55);

  doc.setTextColor(157, 183, 222);
  doc.text(createdLabel, pageWidth - PAGE_MARGIN_X, 55, { align: "right" });

  doc.setDrawColor(82, 115, 172);
  doc.setLineWidth(0.7);
  doc.line(PAGE_MARGIN_X, HEADER_HEIGHT - 8, pageWidth - PAGE_MARGIN_X, HEADER_HEIGHT - 8);
}

function renderMessageChunk(
  doc: jsPDF,
  payload: {
    message: Message;
    chunkLines: PdfLine[];
    bubbleX: number;
    bubbleWidth: number;
    bubbleHeight: number;
    cursorY: number;
    userMessage: boolean;
    timestamp: string;
    firstChunk: boolean;
    hasMoreChunks: boolean;
  }
): void {
  const {
    message,
    chunkLines,
    bubbleX,
    bubbleWidth,
    bubbleHeight,
    cursorY,
    userMessage,
    timestamp,
    firstChunk,
    hasMoreChunks
  } = payload;

  const roleLabel = userMessage ? "Voce" : "Assistente";
  const roleInfo = firstChunk
    ? `${roleLabel} - ${timestamp}`
    : `${roleLabel} - continua`;
  const roleX = userMessage ? bubbleX + bubbleWidth : bubbleX;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.8);
  if (userMessage) {
    doc.setTextColor(57, 95, 165);
  } else {
    doc.setTextColor(84, 106, 141);
  }
  doc.text(roleInfo, roleX, cursorY + ROLE_LINE_HEIGHT, {
    align: userMessage ? "right" : "left"
  });

  const bubbleY = cursorY + ROLE_LINE_HEIGHT + ROLE_TO_BUBBLE_GAP;

  if (userMessage) {
    doc.setFillColor(55, 94, 172);
    doc.setDrawColor(73, 117, 200);
  } else {
    doc.setFillColor(231, 238, 252);
    doc.setDrawColor(190, 208, 238);
  }
  doc.setLineWidth(0.6);
  doc.roundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 11, 11, "FD");

  let lineCursorY = bubbleY + BUBBLE_PADDING_TOP;
  const textStartX = bubbleX + BUBBLE_PADDING_X;

  for (const line of chunkLines) {
    lineCursorY += line.beforeGap;

    const lineHeight = getLineHeight(line.style);
    const textBaselineY = lineCursorY + getBaselineOffset(line.style);
    applyTextStyle(doc, line.style, userMessage);

    if (line.url && line.style === "link") {
      drawLinkedText(doc, line.text, textStartX, textBaselineY, line.url);
    } else {
      doc.text(line.text, textStartX, textBaselineY);
    }

    lineCursorY += lineHeight;
  }

  const footerText = hasMoreChunks ? "Continua na proxima pagina" : `${timestamp} - ID ${message.id}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(META_FONT_SIZE);
  if (userMessage) {
    doc.setTextColor(217, 230, 255);
    doc.text(
      footerText,
      bubbleX + bubbleWidth - BUBBLE_PADDING_X,
      bubbleY + bubbleHeight - BUBBLE_PADDING_BOTTOM,
      { align: "right" }
    );
  } else {
    doc.setTextColor(89, 108, 140);
    doc.text(
      footerText,
      bubbleX + BUBBLE_PADDING_X,
      bubbleY + bubbleHeight - BUBBLE_PADDING_BOTTOM
    );
  }
}

function buildMessageLines(doc: jsPDF, message: Message, maxWidth: number): PdfLine[] {
  const lines: PdfLine[] = [];
  const content = normalizeMessageContent(message.content);
  const files = message.files ?? [];

  if (content) {
    const contentLines = splitTextByWidth(doc, content, maxWidth, "content");
    contentLines.forEach((line) => {
      lines.push({
        text: line,
        style: "content",
        beforeGap: 0
      });
    });
  }

  if (files.length > 0) {
    lines.push({
      text: "Arquivos e imagens",
      style: "section",
      beforeGap: lines.length > 0 ? 8 : 0
    });

    for (const file of files) {
      const fileName = String(file.name || file.url || "arquivo").trim();
      const fileLines = splitTextByWidth(doc, fileName, maxWidth - 10, "link");

      fileLines.forEach((fileLine, index) => {
        lines.push({
          text: `${index === 0 ? "- " : "  "}${fileLine}`,
          style: "link",
          beforeGap: index === 0 ? 4 : 0,
          url: String(file.url || "").trim() || undefined
        });
      });
    }
  }

  if (!lines.length) {
    lines.push({
      text: "(mensagem sem conteudo)",
      style: "content",
      beforeGap: 0
    });
  }

  return lines;
}

function resolveBubbleInnerWidth(doc: jsPDF, lines: PdfLine[], maxWidth: number): number {
  let maxLineWidth = MIN_BUBBLE_INNER_WIDTH;

  for (const line of lines) {
    if (!line.text.trim()) continue;
    applyMeasureStyle(doc, line.style);
    const width = doc.getTextWidth(line.text);
    if (width > maxLineWidth) {
      maxLineWidth = width;
    }
  }

  return Math.min(maxWidth, Math.max(MIN_BUBBLE_INNER_WIDTH, maxLineWidth + 2));
}

function applyMeasureStyle(doc: jsPDF, style: PdfLineStyle): void {
  if (style === "content") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(CONTENT_FONT_SIZE);
    return;
  }

  if (style === "section") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SECTION_FONT_SIZE);
    return;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(LINK_FONT_SIZE);
}

function applyTextStyle(doc: jsPDF, style: PdfLineStyle, userMessage: boolean): void {
  if (style === "content") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(CONTENT_FONT_SIZE);
    if (userMessage) {
      doc.setTextColor(241, 246, 255);
    } else {
      doc.setTextColor(24, 40, 64);
    }
    return;
  }

  if (style === "section") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SECTION_FONT_SIZE);
    if (userMessage) {
      doc.setTextColor(224, 236, 255);
    } else {
      doc.setTextColor(35, 58, 91);
    }
    return;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(LINK_FONT_SIZE);
  if (userMessage) {
    doc.setTextColor(198, 220, 255);
  } else {
    doc.setTextColor(45, 92, 178);
  }
}

function drawLinkedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  url: string
): void {
  if (!url) {
    doc.text(text, x, y);
    return;
  }

  doc.text(text, x, y);
  doc.link(x, y - LINK_FONT_SIZE, Math.max(2, doc.getTextWidth(text)), LINK_LINE_HEIGHT, { url });
}

function splitTextByWidth(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  style: PdfLineStyle
): string[] {
  applyMeasureStyle(doc, style);

  const normalized = text.replace(/\r/g, "");
  const paragraphs = normalized.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push(" ");
      continue;
    }

    const wrapped = doc.splitTextToSize(paragraph, maxWidth);

    if (Array.isArray(wrapped)) {
      lines.push(...wrapped.map((line) => String(line)));
    } else {
      lines.push(String(wrapped));
    }
  }

  return lines;
}

function getLineHeight(style: PdfLineStyle): number {
  if (style === "section") return SECTION_LINE_HEIGHT;
  if (style === "link") return LINK_LINE_HEIGHT;
  return CONTENT_LINE_HEIGHT;
}

function getBaselineOffset(style: PdfLineStyle): number {
  if (style === "section") return 9;
  if (style === "link") return 9.2;
  return 10.2;
}

function drawEmptyConversationState(doc: jsPDF, pageWidth: number): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(57, 81, 120);
  doc.text("Conversa sem mensagens", pageWidth / 2, CONTENT_START_Y + 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(98, 120, 152);
  doc.text(
    "Envie uma mensagem na conversa e exporte novamente para gerar o historico completo.",
    pageWidth / 2,
    CONTENT_START_Y + 38,
    { align: "center", maxWidth: pageWidth - PAGE_MARGIN_X * 2 }
  );
}

function stampPageNumbers(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(108, 128, 160);
    doc.text(`Pagina ${page} de ${pageCount}`, pageWidth - PAGE_MARGIN_X, pageHeight - 14, {
      align: "right"
    });
  }
}

function normalizeMessageContent(value: unknown): string {
  return String(value ?? "").replace(/\r/g, "").trim();
}

function formatDateTime(value?: string): string {
  if (!value) return "sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem data";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function truncateText(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;

  const ellipsis = "...";
  let output = text;

  while (output.length > 0 && doc.getTextWidth(`${output}${ellipsis}`) > maxWidth) {
    output = output.slice(0, -1);
  }

  return output ? `${output}${ellipsis}` : ellipsis;
}

function slugify(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "conversa";
}

function buildTimestampToken(): string {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
