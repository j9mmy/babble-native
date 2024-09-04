# Babble

My little side-project that allows you to converse with various AI models from Hugging Face, all within a single application. Built using Tauri, it's still a work in progress, so more features are expected to come!

*Currently relies on [Serverless Inference API](https://huggingface.co/docs/api-inference/en/index) to make requests on the back-end, instead of fetching from the front-end using something like [Transformers.js](https://huggingface.co/docs/transformers.js/en/index). As it relies on inference, you will need to find a model that supports inference. You can find a list of **warm models**[^1] [here](https://huggingface.co/models?inference=warm&pipeline_tag=text-generation). If the options don't satisfy you, you could try browsing the list of **cold models**[^2] [here](https://huggingface.co/models?inference=cold&pipeline_tag=text-generation).*

## Usage

1. **Enter your [User Access or API token](https://huggingface.co/docs/hub/security-tokens)**: Click on the key icon to enter your Token for accessing the AI models.
2. **Send a message**: Enter your message and click the send button to send your message to the AI.

## Features

- **Start a conversation**: Chat with various Hugging Face models whilst maintaining conversation context.
- **Switch/add conversations**: Start a new topic whilst nesting your older conversations for later.
- **Switch/add models**: Switch between different models, or input your own desired Hugging Face models.

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

[^1]: When you make a request to the API with a warm model, it means the model has been used recently, and its cache already contains the necessary weights. This allows the model to process your input more quickly, as it doesn't need to download the weights again.
[^2]: When you make a request to the API with a cold model, it means the model has not been used recently, and its cache is empty. In this case, the model will need to download the necessary weights from the cloud before it can start processing your input. This process can take some time, depending on the size of the model and the speed of the network.
