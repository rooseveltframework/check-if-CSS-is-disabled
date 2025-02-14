/******/var __webpack_modules__={
/***/"./check-if-css-is-disabled.js":
/*!*************************************!*\
  !*** ./check-if-css-is-disabled.js ***!
  \*************************************/
/***/module=>{module.exports=params=>{const justCheck=!!params?.justCheck;const exemptedIds=params?.exemptedIds||[];
// check if any CSS assets fail to load
document.querySelectorAll('link[rel="stylesheet"]').forEach((link=>{link.addEventListener("error",handleCssAssetFailingToLoad)}));function handleCssAssetFailingToLoad(errorEvent){
// remove all stylesheets if any fail to load, but only if the justCheck flag is falsey
if(!justCheck){for(const link of document.querySelectorAll('link[rel="stylesheet"]'))if(!exemptedIds.includes(link.id))link.remove();for(const style of document.querySelectorAll("style"))if(!exemptedIds.includes(style.id))style.remove()}window.dispatchEvent(new CustomEvent("cssDisabled",{detail:{message:"At least one stylesheet failed to load. It is unsafe to execute any further JavaScript if the CSS has not loaded properly."}}));if(window.linkTagError)return true;// return true if a previous error has been logged
else return!!errorEvent;// return true if this function is called by an error event and return false if it is called directly below and no previous error has been logged
}
// test if the browser has explicitly disabled CSS
let cssDisabled=false;// must be proven otherwise
const testElement=document.createElement("div");testElement.style.position="absolute";document.body.appendChild(testElement);cssDisabled=document.defaultView.getComputedStyle(testElement,null).getPropertyValue("position")==="static";document.body.removeChild(testElement);
// if the justCheck flag is present, we only want to notify the developer that CSS is disabled, not take any actions
if(justCheck)if(cssDisabled){window.dispatchEvent(new CustomEvent("cssDisabled",{detail:{message:"CSS is disabled. It is unsafe to execute any further JavaScript if the CSS has not loaded properly."}}));return true}else return handleCssAssetFailingToLoad();else// if the justCheck flag is not present, then stop execution of the JS if CSS is disabled
if(cssDisabled||handleCssAssetFailingToLoad())throw new Error("CSS is disabled. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.");else return false}
/***/
/******/}};
/************************************************************************/
/******/ // The module cache
/******/var __webpack_module_cache__={};
/******/
/******/ // The require function
/******/function __webpack_require__(moduleId){
/******/ // Check if module is in cache
/******/var cachedModule=__webpack_module_cache__[moduleId];
/******/if(cachedModule!==void 0)
/******/return cachedModule.exports;
/******/
/******/ // Create a new module (and put it into the cache)
/******/var module=__webpack_module_cache__[moduleId]={
/******/ // no module.id needed
/******/ // no module.loaded needed
/******/exports:{}
/******/};
/******/
/******/ // Execute the module function
/******/__webpack_modules__[moduleId](module,module.exports,__webpack_require__);
/******/
/******/ // Return the exports of the module
/******/return module.exports;
/******/}
/******/
/************************************************************************/
/******/
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module is referenced by other modules so it can't be inlined
/******/__webpack_require__("./check-if-css-is-disabled.js");
/******/
//# sourceMappingURL=check-if-css-is-disabled.mjs.map