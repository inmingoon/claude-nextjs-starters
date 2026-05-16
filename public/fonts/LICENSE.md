# Bundled Fonts — License Notice

This directory ships fonts that are redistributed alongside the application's
PDF rendering pipeline. Each font remains the property of its original
copyright holder; the project bundles only what is needed to render Korean
invoice content.

## Pretendard

- **Files**: `Pretendard-Regular.woff2` (web subset, 260KB) · `Pretendard-Regular.otf` (1.54MB, fontkit-compatible for `@react-pdf/renderer` — see `docs/decisions/pdf-engine.md`)
- **Source**: https://github.com/orioncactus/pretendard
- **Copyright**: Copyright (c) 2021 Kil Hyung-jin
- **License**: SIL Open Font License, Version 1.1
- **License text**: https://scripts.sil.org/OFL

The OFL permits embedding the font in documents (including the generated
invoice PDFs) and redistributing the font file as part of this repository,
provided the font is not sold by itself and the copyright notice and license
are preserved. This file satisfies that preservation requirement.

If the bundled font is replaced or additional weights are added, update this
notice in the same commit.
