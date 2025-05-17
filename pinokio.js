const { app } = require("pinokio");

module.exports = app({
  name: "LTX-Video (Web UI)",
  description: "Run Lightricks' image-to-video diffusion model locally with Metal acceleration and a web interface.",
  repo: "https://github.com/Lightricks/LTX-Video",

  async onInstall() {
    await this.clone();

    await term.install([
      "python3 -m venv venv",
      "source venv/bin/activate && pip install --upgrade pip",
      "source venv/bin/activate && pip install torch torchvision torchaudio",
      "source venv/bin/activate && pip install diffusers transformers accelerate safetensors opencv-python scipy gradio"
    ]);

    await term.exec("brew install ffmpeg || true");

    await fs.mkdir("models");
    await term.exec("curl -L -o models/model.safetensors https://huggingface.co/lightricks/LTX-Video/resolve/main/model.safetensors");

    await fs.writeFile("web_ui.py", `
import gradio as gr
import subprocess
import os

def generate_video(image):
    image_path = "input_image.jpg"
    video_path = "output_video.mp4"
    image.save(image_path)
    command = f"source venv/bin/activate && python inference.py --input_image {image_path} --output_video {video_path}"
    result = subprocess.run(command, shell=True, capture_output=True)
    if result.returncode != 0:
        return f"Error: {result.stderr.decode()}", None
    return "Success", video_path

gr.Interface(
    fn=generate_video,
    inputs=gr.Image(type="pil", label="Upload Image"),
    outputs=[gr.Text(label="Status"), gr.Video(label="Generated Video")],
    title="LTX-Video: Image to Video Generator",
    description="Upload a still image and generate a short video using Lightricks' diffusion model."
).launch()
    `);
  },

  async onRun() {
    await term.runInShell("source venv/bin/activate && python web_ui.py");
  }
});
