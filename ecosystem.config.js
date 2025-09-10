module.exports = {
    apps: [
      {
        name: "localboxs",
        script: "npm",
        args: "start",
        cwd: "/opt/localboxs-site",
        env: {
          PORT: 3200,
          NODE_ENV: "production"
        }
      }
    ]
  };
  