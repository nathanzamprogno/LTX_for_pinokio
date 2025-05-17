module.exports = app({
  name: "Test App",
  description: "Simple hello world app.",
  async onInstall() {
    await term.exec("echo 'Installing test app'");
  },
  async onRun() {
    await term.exec("echo 'Running test app'");
  }
});
