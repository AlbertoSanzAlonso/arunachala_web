/**
 * Aplica meta tags en el HTML antes de que React hidrate.
 */
(function () {
  var path = window.location.pathname;
  if (path !== '/' && !path.endsWith('/')) path += '/';
  var search = window.location.search || '';
  var fullPath = path + search;

  function apply(route) {
    if (!route) return;
    var canonical = 'https://www.yogayterapiasarunachala.es' + route.path;
    document.title = route.title;

    function setMeta(selector, attr, value) {
      var el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    }

    setMeta('meta[name="description"]', 'content', route.description);
    setMeta(
      'meta[name="robots"]',
      'content',
      route.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'
    );
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:title"]', 'content', route.title);
    setMeta('meta[property="og:description"]', 'content', route.description);
    setMeta('meta[name="twitter:title"]', 'content', route.title);
    setMeta('meta[name="twitter:description"]', 'content', route.description);

    var link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }

  var privatePrefixes = ['/dashboard', '/login', '/forgot-password', '/reset-password', '/newsletter', '/unsubscribe', '/confirmar-suscripcion'];
  for (var i = 0; i < privatePrefixes.length; i++) {
    if (path === privatePrefixes[i] + '/' || path.indexOf(privatePrefixes[i] + '/') === 0) {
      apply({
        path: path,
        title: 'Arunachala',
        description: 'Panel y utilidades de Arunachala Yoga y Terapias.',
        noindex: true
      });
      return;
    }
  }

  fetch('/seo-routes.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (routes) {
      var match = routes.find(function (r) { return r.path === fullPath || r.path === path; });
      apply(match);
    })
    .catch(function () { /* silencioso */ });
})();
