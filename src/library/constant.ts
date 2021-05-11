/** some useful constants... */

/**
 * const: _dirname
 * Get the root directory
 */
export const _dirname = (() => {
    return (Deno.mainModule).substring(0, Deno.mainModule.lastIndexOf("/") + 1).substr(8);
})();

/**
 * const: _version
 * Get Denly framework version
 */
export const _version = "V0.21";