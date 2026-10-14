# convert-references

Output: `docs/episodes/<slug>/reference/<file-slug>/design-reference.md` per item under the Brief's `## Episode Design Reference`, with the whole-page images in `pages/` and marker's larger cut-outs in `crops/` beside it. A script writes every byte, so the job has no reviewer and its implementor writes no word of the output.

## Prompt

For each item under the Brief's `## Episode Design Reference`, `[<title>](reference/<file-slug>/design-reference.md)`, run from the Episode's worktree:

```sh
npm run convert-reference -- .scratch/<slug>/<file-slug>.<file-extension> docs/episodes/<slug>/reference/<file-slug> --title "<title>"
```

The file is the copy brief-grill made of the one brought in. The script reads PDF only, since its page images come from the PDF: any other file is a `Needs human:` line asking for its PDF export, saved beside it as `.scratch/<slug>/<file-slug>.pdf`. The script takes about 7 s a page: run it in the background and convert the files one after another, since marker's OCR server serves one run at a time. A rerun replaces the earlier output.

The script prints each missing tool with its install line: `marker_single` (`uv tool install marker-pdf`), `pdftoppm` and `pdfinfo` (`brew install poppler`), `magick` (`brew install imagemagick`). Marker reads image-only pages through a local OCR model. By default it starts a llama.cpp `llama-server` itself (`brew install llama.cpp`; the first run downloads the 1.5 GB model). To use an oMLX server holding `surya-ocr-2-mlx` instead, set `SURYA_INFERENCE_URL=http://localhost:<port>/v1`, `SURYA_INFERENCE_BACKEND=vllm`, `VLLM_API_KEY=<the oMLX key>` and `SURYA_MODEL_CHECKPOINT=surya-ocr-2-mlx` for the run. A tool still missing after that is a `Blocked:` line naming it: the jobs that read the design reference want this job, so the Episode runs on without it.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Beyond them:

1. Every design reference the Brief lists has its `design-reference.md`, one `## Page <n>` per page of its PDF.
2. Open one page image per design reference and its `## Page <n>` text: the text is the page's words. A page whose text came back empty or garbled is a `Needs human:` line naming the page, never a hand edit.

Then append the run-log entry, whose Output names each `design-reference.md` with its page count and the cut-outs kept, and its runs CSV row.
