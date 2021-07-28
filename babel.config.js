module.exports = {
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        pragma: "h",
        pragmaFrag: '"span"'
      }
    ],
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["@babel/plugin-transform-runtime"]
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry"
      }
    ]
  ]
};
