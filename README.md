# Waste2Power — Waste & Energy Hackathon Prototype

A responsive frontend demo for recording campus waste, viewing illustrative energy/value estimates, and showing responsible disposal guidance.

## Run locally
1. Extract `Waste2Power_Improved.zip`.
2. Open the `Waste2Power` folder in VS Code.
3. Open `index.html` in a browser, or run it with the VS Code Live Server extension.
4. No build step or API key is required. An internet connection is only needed for optional external fonts, if enabled.

## Demo flow
1. Start on Dashboard and explain that the displayed starter records are sample data.
2. Open Scan Waste and optionally upload a reference photo.
3. Manually choose a category, enter the weight, and save the entry.
4. Show how the dashboard totals, composition chart, recent activity, and waste table update.
5. Delete an entry to demonstrate the interaction and persistence in the browser.
6. Open Energy & Impact and explain that values are estimates based on illustrative coefficients.

## What's included
- Responsive sidebar navigation and dashboard pages
- Local image preview with file-type and size checks
- Manual waste-category selection and disposal suggestions
- Waste log with add/delete interactions
- Dynamic totals, category composition, and bar chart
- Browser `localStorage` persistence
- Collection-route concept and e-waste guidance

## Important limitations — be transparent in the pitch
- This is a frontend prototype, not a deployed production service.
- **Image classification is not AI-powered yet.** Users select the category manually; the photo is only a reference preview.
- Energy and estimated value coefficients are illustrative demo values, not verified engineering or financial figures.
- Route details and collection savings are concepts, not live GPS, IoT sensor, or route-optimization data.
- No backend, login, cloud database, or external AI API is connected.

## Suggested next technical milestone
Connect an image classifier (such as a trained model or a permitted inference API), validate the energy coefficients with a credible source, and add a backend for shared campus data.


### Waste-to-Energy Simulator
Open **Energy & Impact**, choose a waste category, enter a quantity in kilograms, and press **Calculate estimate**. The simulator updates the indicative energy, material value, and suggested handling pathway. These are demonstration coefficients, not validated energy yields or live market prices; e-waste is directed to authorised handling rather than energy conversion.
