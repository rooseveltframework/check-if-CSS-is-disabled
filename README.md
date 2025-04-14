[![npm](https://img.shields.io/npm/v/check-if-css-is-disabled.svg)](https://www.npmjs.com/package/check-if-css-is-disabled)

Frontend JavaScript module that can determine if CSS is disabled or if it failed to load, then take action to stop JS enhancements from applying if the CSS isn't working first.

If your CSS fails to load but your JS does load, that can lead to mangled-looking user interfaces. But if you build your website using a [progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement) technique, this module will also let you do graceful degradation elegantly by making it easy for you to revert to the non-CSS and non-JS experience if your CSS fails but your JS doesn't.

As such, if no CSS or JS loads but you built your site using [semantic HTML](https://en.wikipedia.org/wiki/Semantic_HTML), it should still look reasonably good with the default styles applied and function reasonably well so long as no JS is mucking with the DOM.

This module was built and is maintained by the [Roosevelt web framework](https://rooseveltframework.org) [team](https://rooseveltframework.org/contributors), but it can be used independently of Roosevelt as well.

<details open>
  <summary>Documentation</summary>
  <ul>
    <li><a href="./USAGE.md">Usage</a></li>
  </ul>
</details>
