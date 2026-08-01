/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Architecture Dependency Rules
 * ============================================================
 */


export const dependencyRules = {


  core: {

    canImport: [

      "core",

    ],

    cannotImport: [

      "features",

    ],

  },



  features: {

    canImport: [

      "core",

      "features",

    ],

    cannotImport: [

      "core/internal",

    ],

  },


};