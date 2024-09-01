# Babble

A little side-project where you can chat with various AI models from Hugging Face. Built using Tauri and still a work in progress. Currently relies on [Serverless Inference API](https://huggingface.co/docs/api-inference/en/index) to make requests on the back-end, instead of fetching from the front-end using something like [Transformers.js](https://huggingface.co/docs/transformers.js/en/index)

## Usage

- **Enter your [User Access or API token](https://huggingface.co/docs/hub/security-tokens)**: Click on the key icon to enter your Token for accessing the AI models.
- **Type a message**: Enter your message in the input field at the bottom.
- **Send the message**: Click the send button to send your message to the AI.
- **Switch models**: Click on the model name at the top to switch between different AI models.

## Getting Started

1. **Clone the repo**:
    ```sh
    git clone https://github.com/j9mmy/babble-native.git
    cd babble-native
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Run the app (dev)**:
    ```sh
    npm run tauri dev
    ```
