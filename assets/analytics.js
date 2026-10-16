// analytics.js: the only file on the blog that talks to PostHog.
// Same PostHog project and settings as hyperparam.app (lib/client/analytics.ts):
// page views, page leave, and clicks with all element text and attributes masked.
// No session replay, heatmaps, surveys, or feature flags.
//
// The blog is served by GitHub Pages, so there is no edge to set the hyp_region
// cookie and no consent banner. Every visitor gets the "consent required, not yet
// chosen" behavior from the hyperparam.app privacy policy: PostHog runs in memory,
// with no cookie, no browser storage, and no person profile.
//
// Events go through the hyperparam.app /ingest proxy, which forwards to PostHog US Cloud.
(function () {
  "use strict";

  var POSTHOG_KEY = "phc_umBmfddpD6c63ezbgsi6d7VY5rDSf3Lmm9cx95Az7Gvw";
  var POSTHOG_HOST = "https://hyperparam.app/ingest";
  var INTERNAL_KEY = "hyp_internal";

  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  // ?internal=1 marks this browser as internal traffic, ?internal=0 clears it.
  function readInternalFlag() {
    var q = new URLSearchParams(location.search).get("internal");
    try {
      if (q === "1") localStorage.setItem(INTERNAL_KEY, "1");
      if (q === "0") localStorage.removeItem(INTERNAL_KEY);
      return localStorage.getItem(INTERNAL_KEY) === "1";
    } catch (e) { return q === "1"; }
  }
  var internal = readInternalFlag();

  // Standard posthog-js loader: queues calls until array.js arrives from api_host.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(/\/$/,"")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister set_config identify alias people.set people.set_once reset group startSessionRecording stopSessionRecording opt_in_capturing opt_out_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
    person_profiles: "never",
    persistence: "memory",
    autocapture: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    capture_heatmaps: false,
    capture_dead_clicks: false,
    capture_pageview: "history_change",
    capture_pageleave: true,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
  });
  window.posthog.register(internal ? { product: "hyperparam", is_internal: true } : { product: "hyperparam" });

  // Links that leave the blog report outbound_clicked with the destination host only.
  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest && event.target.closest("a[href]");
    if (!link) return;
    var url;
    try { url = new URL(link.href, location.href); } catch (e) { return; }
    if (url.host === location.host || (url.protocol !== "https:" && url.protocol !== "http:")) return;
    var where = link.closest("header") ? "header" : link.closest("footer") ? "footer" : "post";
    window.posthog.capture("outbound_clicked", { destination: url.hostname, location: where });
  });
})();
