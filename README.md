# OSI & TCP/IP Model Visualizer

A premium, interactive web application to help visualize and understand the OSI and TCP/IP networking models. This visualizer demonstrates how data passes through each layer (encapsulation and decapsulation) when a message is sent over a network.

## Features

*   **Side-by-side Simulation**: Visualizes a "Sender" stack encapsulating data layer-by-layer and transmitting it across a "Physical Medium" to a "Receiver" stack.
*   **Model Toggling**: Seamlessly switch between the classic 7-layer OSI model and the 4-layer TCP/IP model.
*   **Interactive Simulation**: Step through the encapsulation and decapsulation processes to see exactly how networking headers are added and stripped away.
*   **Information Panel**: Click on any layer (or watch the simulation progress) to reveal layer descriptions, common protocols, and the active Protocol Data Unit (PDU).

## How to Run

This application is built with pure, vanilla HTML, CSS, and JavaScript. There are no dependencies to install and no build processes required!

1.  Clone this repository to your local machine:
    ```bash
    git clone https://github.com/jayaprakashnarayana/osi-model-visualizer.git
    cd osi-model-visualizer
    ```

2.  Open the `index.html` file in your favorite web browser. You can do this by double-clicking the file in your file explorer, or via the terminal using:

    *   **macOS:**
        ```bash
        open index.html
        ```
    *   **Linux:**
        ```bash
        xdg-open index.html
        ```
    *   **Windows:**
        ```bash
        start index.html
        ```

## How to Use

1.  **Select your model:** Use the toggle in the top right to switch between the 7-layer OSI model and the 4-layer TCP/IP model.
2.  **Explore Layers:** Click on any of the layers (e.g., Application, Transport, Data Link) to read more about its responsibilities, typical protocols, and PDU name.
3.  **Run the Simulation:** 
    *   Click the **"Send Message"** button to start the process.
    *   Click **"Next Step"** to manually step through each layer as the data encapsulates down the sender's stack, moves across the wire, and decapsulates up the receiver's stack.
    *   Observe how the headers (e.g., A-HDR, TCP-HDR) are added and removed at each stage.
    *   Click **"Reset"** to return the simulation to its initial state.
