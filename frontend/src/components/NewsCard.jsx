import React, { useState } from "react";
import { FiArrowUpRight, FiImage } from "react-icons/fi";

const PLACEHOLDER_IMAGE = "/placeholder-news.jpg";

function NewsCard({ article }) {
  const link = article.link || article.url;
  const source = article.publisher || article.source || "Market News";
  const description = article.summary || article.description || "Read the full market story for more details.";
  const image = article.image || article.thumbnail || PLACEHOLDER_IMAGE;
  const [imageSrc, setImageSrc] = useState(image);
  const published = formatPublished(article.published);

  return (
    <article className="dashboard-card group animate-fade-in flex min-h-[420px] flex-col overflow-hidden">
      {imageSrc ? (
        <div className="h-52 w-full overflow-hidden bg-theme-bg">
          <img
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageSrc(imageSrc === PLACEHOLDER_IMAGE ? "" : PLACEHOLDER_IMAGE)}
            src={imageSrc}
          />
        </div>
      ) : (
        <div className="flex h-52 w-full items-center justify-center bg-theme-accent/10 text-theme-accent">
          <FiImage size={36} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-400">{source}</span>
          {published && (
            <time className="rounded-full border border-theme-border px-3 py-1 text-theme-muted">{published}</time>
          )}
        </div>

        <h3 className="line-clamp-2 text-xl font-black leading-7 text-theme-text">{article.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-theme-muted">{description}</p>

        {link && (
          <a
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400/15"
            href={link}
            rel="noreferrer"
            target="_blank"
          >
            Read More
            <FiArrowUpRight size={16} />
          </a>
        )}
      </div>
    </article>
  );
}

function formatPublished(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default NewsCard;
