module.exports = (params) => {
  const justCheck = !!params?.justCheck
  const exemptedIds = params?.exemptedIds || []

  // check if any CSS assets fail to load
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    link.addEventListener('error', handleCssAssetFailingToLoad)
  })
  function handleCssAssetFailingToLoad (errorEvent) {
    if (errorEvent) window.linkTagError = true

    // remove all stylesheets if any fail to load, but only if the justCheck flag is falsey
    if (!justCheck) {
      for (const link of document.querySelectorAll('link[rel="stylesheet"]')) if (!exemptedIds.includes(link.id)) link.remove()
      for (const style of document.querySelectorAll('style')) if (!exemptedIds.includes(style.id)) style.remove()
    }
    window.dispatchEvent(new CustomEvent('cssDisabled', {
      detail: {
        message: 'At least one stylesheet failed to load. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.'
      }
    }))
    if (window.linkTagError) return true // return true if a previous error has been logged
    else return !!errorEvent // return true if this function is called by an error event and return false if it is called directly below and no previous error has been logged
  }

  // test if the browser has explicitly disabled CSS
  let cssDisabled = false // must be proven otherwise
  const testElement = document.createElement('div')
  testElement.style.position = 'absolute'
  document.body.appendChild(testElement)
  cssDisabled = document.defaultView.getComputedStyle(testElement, null).getPropertyValue('position') === 'static'
  document.body.removeChild(testElement)

  // if the justCheck flag is present, we only want to notify the developer that CSS is disabled, not take any actions
  if (justCheck) {
    if (cssDisabled) {
      window.dispatchEvent(new CustomEvent('cssDisabled', {
        detail: {
          message: 'CSS is disabled. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.'
        }
      }))
      return true
    } else return handleCssAssetFailingToLoad()
  } else { // if the justCheck flag is not present, then stop execution of the JS if CSS is disabled
    if (cssDisabled || handleCssAssetFailingToLoad()) throw new Error('CSS is disabled. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
    else return false
  }
}
