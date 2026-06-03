---
layout: page
title: Search
---

Search the site with Google:

<style>
  .gsc-control-cse,
  .gsc-webResult.gsc-result,
  .gsc-results .gsc-imageResult {
    background-color: var(--color-bg) !important;
    border: none !important;
  }

  table.gsc-search-box,
  table.gsc-search-box td,
  table.gsc-search-box th,
  table.gsc-above-wrapper-area-container,
  table.gsc-above-wrapper-area-container td,
  table.gsc-above-wrapper-area-container th,
  table.gsc-resultsHeader,
  table.gsc-resultsHeader td,
  table.gsc-resultsHeader th {
    background-color: transparent !important;
    border-color: transparent !important;
  }

  input.gsc-input {
    color: var(--color-text) !important;
    background-color: var(--color-bg) !important;
    border: none !important;
  }

  .gsc-input-box,
  .gsc-input-box-hover,
  .gsc-input-box-focus {
    background-color: var(--color-bg) !important;
    border-color: var(--color-border) !important;
  }

  .gsc-search-button-v2 {
    background-color: var(--color-surface) !important;
    border: none !important;
  }

  .gsc-search-button-v2 svg {
    fill: var(--color-text) !important;
  }

  .gsc-result .gs-title,
  .gsc-result .gs-title * {
    color: var(--color-link) !important;
  }

  .gsc-result .gs-snippet,
  .gsc-result .gs-visibleUrl,
  .gsc-above-wrapper-area,
  .gsc-cursor-page,
  .gcsc-find-more-on-google {
    color: var(--color-text) !important;
  }

  .gsc-cursor-current-page {
    color: var(--color-link) !important;
  }
</style>

<script>
  (function() {
    var cx = '005101733046013339255:zbcros0nd_0';
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
  })();
</script>

<gcse:search></gcse:search>
