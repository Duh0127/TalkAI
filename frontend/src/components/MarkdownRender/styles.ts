import styled from "styled-components";

export const MarkdownRoot = styled.div`
  margin: 0;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  white-space: normal;
  overflow-wrap: anywhere;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  p {
    margin: 0 0 0.9em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.15em 0 0.45em;
    color: #f2f6ff;
    line-height: 1.28;
    font-weight: 600;
    letter-spacing: 0;
  }

  h1 {
    font-size: 1.42em;
  }

  h2 {
    font-size: 1.3em;
  }

  h3 {
    font-size: 1.18em;
  }

  h4,
  h5,
  h6 {
    font-size: 1.03em;
  }

  ul,
  ol {
    margin: 0.3em 0 0.85em;
    padding-left: 1.35em;
  }

  li {
    margin: 0.2em 0;
  }

  li > p {
    margin: 0.15em 0;
  }

  blockquote {
    margin: 0.85em 0;
    padding: 0.1em 0 0.1em 0.85em;
    border-left: 2px solid rgba(123, 168, 246, 0.8);
    color: rgba(188, 206, 232, 0.96);
  }

  hr {
    border: 0;
    border-top: 1px solid rgba(109, 149, 214, 0.35);
    margin: 0.95em 0;
  }

  a {
    color: #84aef7;
    text-decoration: underline;
    text-decoration-color: rgba(132, 174, 247, 0.55);
    text-underline-offset: 2px;
    transition: color 0.2s ease, text-decoration-color 0.2s ease;
  }

  a:hover {
    color: #b7cff7;
    text-decoration-color: rgba(183, 207, 247, 0.75);
  }

  pre {
    margin: 0.85em 0;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(109, 149, 214, 0.34);
    background: rgba(8, 14, 24, 0.94);
    overflow-x: auto;
  }

  pre code {
    display: block;
    min-width: max-content;
    white-space: pre;
    font-family: "Consolas", "SFMono-Regular", Menlo, Monaco, monospace;
    font-size: 12px;
    line-height: 1.58;
    color: #e6eefb;
  }

  :not(pre) > code {
    padding: 0.16em 0.4em;
    border-radius: 6px;
    border: 1px solid rgba(109, 149, 214, 0.28);
    background: rgba(13, 24, 39, 0.9);
    font-family: "Consolas", "SFMono-Regular", Menlo, Monaco, monospace;
    font-size: 0.84em;
    color: #d8e6fa;
  }

  table {
    width: 100%;
    display: block;
    margin: 0.85em 0;
    border-radius: 10px;
    border: 1px solid rgba(109, 149, 214, 0.3);
    background: rgba(10, 17, 28, 0.88);
    border-collapse: separate;
    border-spacing: 0;
    overflow-x: auto;
  }

  thead {
    background: rgba(22, 37, 60, 0.9);
  }

  th,
  td {
    border-bottom: 1px solid rgba(109, 149, 214, 0.2);
    padding: 8px 10px;
    text-align: left;
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: 0;
  }

  th {
    color: #ebf2ff;
    font-size: 12px;
    font-weight: 600;
  }

  td {
    color: #d6e2f4;
    font-size: 12.8px;
  }

  .md-media {
    margin: 0.9em 0;
  }

  .md-media img {
    width: 100%;
    max-height: 520px;
    object-fit: contain;
    border-radius: 10px;
    border: 1px solid rgba(109, 149, 214, 0.35);
    background: rgba(8, 14, 24, 0.94);
  }

  .md-media figcaption {
    margin-top: 0.45em;
    color: rgba(164, 184, 214, 0.92);
    font-size: 12px;
  }

  .md-video {
    width: 100%;
    max-height: 520px;
    border-radius: 10px;
    border: 1px solid rgba(109, 149, 214, 0.35);
    background: rgba(8, 14, 24, 0.94);
  }

  .md-video-embed {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(109, 149, 214, 0.35);
    background: rgba(8, 14, 24, 0.94);
  }

  .md-video-embed iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .md-document-link {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    border: 1px solid rgba(109, 149, 214, 0.38);
    background: rgba(10, 18, 30, 0.9);
    color: #d8e6fa;
    text-decoration: none;
    padding: 9px 10px;
    transition: filter 0.2s ease, border-color 0.2s ease;
  }

  .md-document-link:hover {
    filter: brightness(1.03);
    border-color: rgba(123, 168, 246, 0.74);
  }

  .md-document-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    height: 22px;
    border-radius: 999px;
    background: rgba(77, 132, 255, 0.22);
    border: 1px solid rgba(123, 168, 246, 0.5);
    color: #eaf2ff;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .md-document-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12.5px;
    font-weight: 500;
  }

  @media (max-width: 680px) {
    font-size: 13.5px;

    pre {
      padding: 10px 11px;
    }
  }
`;

